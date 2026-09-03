/*
  collector.js — V2 data collector for DealRadar.

  WHAT IT DOES
    1. Asks the Delhi Duty Free website (a Magento store) for products,
       using the SAME GraphQL endpoint the website's own frontend uses.
    2. Matches them against our market prices (market-prices.json).
    3. Rewrites ../data.js with fresh prices + a timestamp.
       The webapp then shows "🟢 Live prices · updated X min ago".

  HOW TO RUN
    cd collector
    node collector.js

  BEING A GOOD CITIZEN (important!)
    - We request ONE small page per category, a few times a day at most.
    - We wait 2 seconds between requests.
    - We identify ourselves with a normal browser User-Agent.
    - If the site says no (403/429), we STOP — we never hammer or retry hard.
    This is roughly the load of one person browsing the site once.
*/

const fs = require("fs");
const path = require("path");

const SITE = "https://www.delhidutyfree.co.in";
const GRAPHQL = SITE + "/graphql";

// Import official liquor MRP data
const { getOfficialLiquorMRP } = require("./liquor-mrp-fetcher");

// Import Amazon scraper (optional - may fail if Amazon blocks)
let fetchAmazonPrices;
try {
  ({ fetchAmazonPrices } = require("./amazon-scraper"));
} catch (e) {
  console.warn("⚠️  Amazon scraper not available - proceeding without it");
  fetchAmazonPrices = async () => [];
}

// Categories we care about -> search terms used to fetch from API
// Using search-based approach which is more reliable than category_url_path
const CATEGORIES = [
  { name: "Perfumes",     search: "perfume OR cologne OR fragrance" },
  { name: "Chocolates",   search: "chocolate OR candy" },
  { name: "Liquor",       search: "whiskey OR vodka OR rum OR gin OR brandy OR cognac" },
  { name: "Cosmetics",    search: "moisturizer OR sunscreen OR makeup OR skincare" },
  { name: "Electronics",  search: "headphones OR earbuds OR speaker" },
  { name: "Accessories",  search: "watch OR belt OR bag OR sunglasses" },
  { name: "Beverages",    search: "energy drink OR coffee OR tea" },
];

// Standard Magento GraphQL product query — using search instead of category filter
function productQuery(searchTerm) {
  return `
  {
    products(
      search: "${searchTerm}"
      pageSize: 50
      currentPage: 1
    ) {
      total_count
      items {
        name
        sku
        url_key
        categories { name url_path }
        price_range {
          minimum_price {
            final_price { value currency }
          }
        }
      }
    }
  }`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCategory(cat) {
  console.log(`→ Fetching "${cat.name}" (search: "${cat.search}") ...`);

  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Look like a normal browser, because that's effectively what we are.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept": "application/json",
    },
    body: JSON.stringify({ query: productQuery(cat.search) }),
  });

  if (res.status === 403 || res.status === 429) {
    // The site is telling us to back off. Respect that — stop entirely.
    throw new Error(`Site refused (${res.status}). Stopping — do NOT retry aggressively.`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for search "${cat.search}"`);
  }

  const json = await res.json();
  if (json.errors) {
    // Usually means the search term is wrong — log and continue
    throw new Error(
      `GraphQL error for "${cat.search}": ${json.errors[0].message}`
    );
  }

  const items = json.data?.products?.items ?? [];
  console.log(`   ✓ got ${items.length} products (site says total: ${json.data?.products?.total_count})`);
  return items.map((it) => ({
    name: it.name,
    sku: it.sku,
    category: it.categories?.[0]?.name || cat.name,
    dutyFree: Math.round(it.price_range.minimum_price.final_price.value),
    currency: it.price_range.minimum_price.final_price.currency,
    url: `${SITE}/${it.url_key}.html`,
  }));
}

// ---- Match a scraped product to our market-price list ----
// Names never match exactly ("Dior Sauvage EDT 100ml" vs "Sauvage Eau de Toilette"),
// so we match if all keywords of the market entry appear in the product name.
function findMarketEntry(productName, marketList) {
  const hay = productName.toLowerCase();
  return marketList.find((m) =>
    m.keywords.every((kw) => hay.includes(kw.toLowerCase()))
  );
}

async function main() {
  // market-prices.json = our manually maintained market side (for perfumes/chocolates/cosmetics).
  const marketList = JSON.parse(
    fs.readFileSync(path.join(__dirname, "market-prices.json"), "utf8")
  );

  // Add official liquor MRP to market list
  const liquorMRPList = getOfficialLiquorMRP();
  
  // Try to fetch Amazon prices and add them to market list
  let amazonPrices = [];
  try {
    amazonPrices = await fetchAmazonPrices();
    console.log(`✓ Fetched ${amazonPrices.length} prices from Amazon\n`);
  } catch (err) {
    console.log(`⚠️  Amazon fetch failed (this is normal if Amazon is blocking): ${err.message}\n`);
  }

  const enhancedMarketList = [
    ...marketList,
    ...liquorMRPList.map(item => ({
      keywords: [item.brand.toLowerCase()],
      brand: item.brand,
      size: item.size,
      marketPrice: item.mrp,
      source: item.source,
      sourceUrl: item.url,
      lastVerified: item.lastVerified,
    })),
    ...amazonPrices.map(item => ({
      keywords: [item.brand.toLowerCase(), item.product.toLowerCase()],
      brand: item.brand,
      size: item.product,
      marketPrice: item.mrp || item.currentPrice,
      source: "Amazon.in",
      sourceUrl: item.sourceUrl || null,
      lastVerified: item.lastUpdated,
    })),
  ];

  console.log(
    `📦 Market data loaded: ${marketList.length} base + ${liquorMRPList.length} liquor MRP + ${amazonPrices.length} Amazon prices\n`
  );

  // Load previous data.js prices so the app can show ▲/▼ changes.
  const dataPath = path.join(__dirname, "..", "data.js");
  const oldPrices = {};
  try {
    const old = fs.readFileSync(dataPath, "utf8");
    // pull "name" + dutyFree pairs out of the old file
    for (const m of old.matchAll(/name:\s*"([^"]+)"[\s\S]*?dutyFree:\s*(\d+)/g)) {
      oldPrices[m[1]] = Number(m[2]);
    }
  } catch { /* first run — fine */ }

  const collected = [];
  for (const cat of CATEGORIES) {
    try {
      const items = await fetchCategory(cat);
      collected.push(...items);
    } catch (err) {
      console.error(`✗ ${err.message}`);
      if (String(err.message).includes("Stopping")) process.exit(1);
    }
    await sleep(2000); // polite pause between categories
  }

  if (collected.length === 0) {
    console.error("\nNo products collected — data.js NOT overwritten. See README for recon steps.");
    process.exit(1);
  }

  // Keep only products we have a market price for (curated comparison, not raw dump)
  const emojiFor = { 
    Perfumes: "🧴", 
    Chocolates: "🍫", 
    Whiskey: "🥃", 
    Liquor: "🥃",
    Cosmetics: "💄",
    Electronics: "🎧",
    Accessories: "👜",
    Beverages: "🥤"
  };
  const products = [];
  for (const item of collected) {
    const market = findMarketEntry(item.name, enhancedMarketList);
    if (!market) continue; // no market price -> can't compare -> skip
    products.push({
      name: item.name,
      brand: market.brand,
      category: item.category,
      size: market.size,
      dutyFree: item.dutyFree,
      dutyFreeSource: "Delhi Duty Free Official Website (GraphQL API)",
      dutyFreeLastUpdated: new Date().toISOString(),
      market: market.marketPrice,
      marketSource: market.source || "Local Retail / Amazon.in",
      marketSourceUrl: market.sourceUrl || null,
      marketLastVerified: market.lastVerified || null,
      emoji: emojiFor[item.category] || "🛍️",
      previousDutyFree: oldPrices[item.name] || null,
      url: item.url,
    });
  }

  console.log(`\n✅ Matched ${products.length} of ${collected.length} scraped products to market prices.`);

  // ---- Write the new data.js ----
  const now = new Date().toISOString();
  const out =
    `// AUTO-GENERATED by collector/collector.js — do not edit by hand.\n` +
    `// Run "node collector/collector.js" to refresh.\n\n` +
    `// Data Sources:\n` +
    `// - Duty Free Prices: Delhi Duty Free official GraphQL API (live, updated daily)\n` +
    `// - Market Prices: Delhi Excise Board (liquor MRP), Amazon.in, local retail\n` +
    `// - Last Updated: ${now}\n\n` +
    `const LAST_UPDATED = "${now}";\n` +
    `const DATA_SOURCE = "live";\n` +
    `const DATA_ATTRIBUTION = {\n` +
    `  dutyFree: "Delhi Duty Free Official Website",\n` +
    `  market: "Official MRP / Retail Aggregators",\n` +
    `  liquor: "Delhi Excise Board",\n` +
    `  amazon: "Amazon.in Public Prices",\n` +
    `  lastUpdated: "${now}"\n` +
    `};\n\n` +
    `const PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;

  fs.writeFileSync(dataPath, out);
  console.log(`✓ Wrote ${products.length} products to data.js at ${now}`);
}

main().catch((err) => {
  console.error("Collector failed:", err.message);
  process.exit(1);
});
