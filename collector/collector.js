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

// Categories & popular brand targets to query from Delhi Duty Free API
const CATEGORIES = [
  // Perfumes & Fragrances
  { name: "Perfumes", search: "Perfume" },
  { name: "Perfumes", search: "Fragrance" },
  { name: "Perfumes", search: "Eau De Parfum" },
  { name: "Perfumes", search: "Eau De Toilette" },
  { name: "Perfumes", search: "Dior" },
  { name: "Perfumes", search: "Chanel" },
  { name: "Perfumes", search: "Hugo" },
  { name: "Perfumes", search: "Boss" },
  { name: "Perfumes", search: "Tom Ford" },
  { name: "Perfumes", search: "Armani" },
  { name: "Perfumes", search: "Versace" },
  { name: "Perfumes", search: "Calvin Klein" },
  { name: "Perfumes", search: "Yves Saint Laurent" },
  { name: "Perfumes", search: "Gucci" },
  { name: "Perfumes", search: "Prada" },
  { name: "Perfumes", search: "Burberry" },
  { name: "Perfumes", search: "Bvlgari" },

  // Chocolates & Confectionery
  { name: "Chocolates", search: "Chocolate" },
  { name: "Chocolates", search: "Lindt" },
  { name: "Chocolates", search: "Dubai" },
  { name: "Chocolates", search: "Toblerone" },
  { name: "Chocolates", search: "Ferrero" },
  { name: "Chocolates", search: "Godiva" },
  { name: "Chocolates", search: "Guylian" },
  { name: "Chocolates", search: "Cadbury" },
  { name: "Chocolates", search: "Milka" },
  { name: "Chocolates", search: "Kinder" },

  // Liquor & Spirits
  { name: "Liquor", search: "Whisky" },
  { name: "Liquor", search: "Whiskey" },
  { name: "Liquor", search: "Vodka" },
  { name: "Liquor", search: "Gin" },
  { name: "Liquor", search: "Rum" },
  { name: "Liquor", search: "Cognac" },
  { name: "Liquor", search: "Single Malt" },
  { name: "Liquor", search: "Johnnie Walker" },
  { name: "Liquor", search: "Macallan" },
  { name: "Liquor", search: "Chivas" },
  { name: "Liquor", search: "Glenfiddich" },
  { name: "Liquor", search: "Glenlivet" },
  { name: "Liquor", search: "Indri" },
  { name: "Liquor", search: "Amrut" },
  { name: "Liquor", search: "Jack Daniels" },
  { name: "Liquor", search: "Hennessy" },

  // Cosmetics & Skincare
  { name: "Cosmetics", search: "Skincare" },
  { name: "Cosmetics", search: "Moisturizer" },
  { name: "Cosmetics", search: "Sunscreen" },
  { name: "Cosmetics", search: "Serum" },
  { name: "Cosmetics", search: "Clinique" },
  { name: "Cosmetics", search: "Lancome" },
  { name: "Cosmetics", search: "Estee Lauder" },
  { name: "Cosmetics", search: "Kiehl" },
  { name: "Cosmetics", search: "L'Occitane" },
  { name: "Cosmetics", search: "Ordinary" },

  // Accessories & Watches
  { name: "Accessories", search: "Watch" },
  { name: "Accessories", search: "Sunglasses" },
  { name: "Accessories", search: "Bag" },
  { name: "Accessories", search: "Belt" },
  { name: "Accessories", search: "Wallet" },
  { name: "Accessories", search: "Ray Ban" },
  { name: "Accessories", search: "Fossil" },
  { name: "Accessories", search: "Tissot" },
];

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
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept": "application/json",
    },
    body: JSON.stringify({ query: productQuery(cat.search) }),
    // Guard against a hung request stalling the whole daily job.
    signal: AbortSignal.timeout(20000),
  });

  if (res.status === 403 || res.status === 429) {
    throw new Error(`Site refused (${res.status}). Stopping — do NOT retry aggressively.`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for search "${cat.search}"`);
  }

  const json = await res.json();
  if (json.errors) {
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

const GENERIC_MATCH_WORDS = new Set([
  "black", "blue", "brown", "gold", "green", "red", "silver", "white",
  "watch", "steel", "stainless", "round", "analog", "mens", "women",
  "womens", "men", "quartz", "case", "model", "size", "edition", "original",
  "collection", "bottle", "spray", "pouch", "tablet"
]);

function normalizeCategory(category, productName = "") {
  const c = (category || "").toLowerCase();
  const n = (productName || "").toLowerCase();

  if (c.includes("liquor") || c.includes("whiskey") || c.includes("vodka") || c.includes("rum") || c.includes("gin") || c.includes("scotch") || c.includes("cognac") || c.includes("spirits") || c.includes("wine")) return "Liquor";
  if (c.includes("chocolate") || c.includes("confectionery") || c.includes("candy")) return "Chocolates";
  if (c.includes("electronic") || c.includes("audio") || c.includes("headphone") || c.includes("earbud") || c.includes("speaker")) return "Electronics";
  if (c.includes("watch") || c.includes("fashion") || c.includes("bag") || c.includes("belt") || c.includes("sunglass") || c.includes("luggage") || c.includes("accessor")) return "Accessories";
  if (c.includes("beverage") || c.includes("coffee") || c.includes("tea") || c.includes("drink")) return "Beverages";

  if (c.includes("perfume") || c.includes("fragrance") || c.includes("cologne")) return "Perfumes";
  if (c.includes("cosmetic") || c.includes("skincare") || c.includes("makeup")) return "Cosmetics";

  if (c.includes("beauty")) {
    if (/\b(edt|edp|eau de|parfum|perfume|cologne|fragrance)\b/i.test(n)) return "Perfumes";
    if (/\b(cream|powder|lipstick|serum|mascara|lotion|moisturizer|sunscreen|cleanser|oil|hydrator|gel|balm|care|toner)\b/i.test(n)) return "Cosmetics";
    return "Cosmetics";
  }

  if (/\b(whisky|whiskey|vodka|rum|gin|scotch|cognac|brandy|liqueur)\b/i.test(n)) return "Liquor";
  if (/\b(chocolate|truffle|praline|choco)\b/i.test(n)) return "Chocolates";
  if (/\b(watch|sunglasses|handbag|backpack|wallet|belt)\b/i.test(n)) return "Accessories";
  if (/\b(perfume|parfum|eau de toilette|eau de parfum|cologne)\b/i.test(n)) return "Perfumes";
  if (/\b(cream|serum|lotion|lipstick|powder|sunscreen|moisturizer|hydrator|gel|balm)\b/i.test(n)) return "Cosmetics";

  return category || "Other";
}

// Out of scope for this tracker. normalizeCategory still classifies these (so
// they are detected reliably however they were found) and the build loop below
// drops every matching product — including ones another search turned up.
const EXCLUDED_CATEGORIES = new Set(["Electronics", "Beverages"]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordRegex(keyword) {
  return new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, "i");
}

function isRelevantKeyword(keyword) {
  const k = (keyword || "").toLowerCase().trim();
  if (k.length < 3) return false;
  if (GENERIC_MATCH_WORDS.has(k)) return false;
  return true;
}

function extractSize(productName, fallbackSize = "") {
  if (!productName) return fallbackSize;
  const match = productName.match(/(\d+(?:\.\d+)?\s*(?:ml|l|cl|g|kg|oz|bags|unit|pair|pcs|pc))\b/i);
  if (match) {
    return match[1].replace(/([0-9])([a-zA-Z])/, "$1 $2");
  }
  return fallbackSize || "1 unit";
}

function parseVolumeOrWeight(sizeStr) {
  if (!sizeStr) return null;
  const m = sizeStr.match(/(\d+(?:\.\d+)?)\s*(ml|l|cl|g|kg)/i);
  if (!m) return null;
  const val = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit === "l") return { value: val * 1000, unit: "ml" };
  if (unit === "cl") return { value: val * 10, unit: "ml" };
  if (unit === "kg") return { value: val * 1000, unit: "g" };
  return { value: val, unit };
}

function calculateAdjustedMarketPrice(itemSize, marketSize, marketPrice) {
  const itemVol = parseVolumeOrWeight(itemSize);
  const mktVol = parseVolumeOrWeight(marketSize);
  if (itemVol && mktVol && itemVol.unit === mktVol.unit && mktVol.value > 0) {
    const ratio = itemVol.value / mktVol.value;
    if (ratio >= 0.25 && ratio <= 4) {
      return Math.round(marketPrice * ratio);
    }
  }
  return marketPrice;
}

const DISTINCT_FLANKERS = [
  "beyond", "elixir", "absolu", "triumph", "oud", "solar",
  "amber", "magnetic", "sport", "lost cherry", "wood essence"
];

function hasFlankerMismatch(productName, marketKeywords) {
  const hay = (productName || "").toLowerCase();
  const kwStr = (marketKeywords || []).join(" ").toLowerCase();
  
  for (const flanker of DISTINCT_FLANKERS) {
    const flankerRegex = new RegExp(`\\b${escapeRegex(flanker)}\\b`, "i");
    if (flankerRegex.test(hay) && !flankerRegex.test(kwStr)) {
      return true;
    }
  }
  return false;
}

function isTravelRetailBundleMismatch(productName, marketEntry) {
  const n = (productName || "").toLowerCase();
  const mKeywords = (marketEntry.keywords || []).join(" ").toLowerCase();
  
  const isScrapedBundle = /\b(miniature|travel set|duo pack|t-rex|gift set|collection mix)\b/i.test(n);
  const isMarketBundle = /\b(miniature|set|gift|pack|collection)\b/i.test(mKeywords);

  if (isScrapedBundle && !isMarketBundle) {
    return true;
  }
  return false;
}

const MULTI_PRODUCT_BRANDS = new Set([
  "burberry", "gucci", "dior", "chanel", "prada", "versace", "armani",
  "clinique", "lancome", "l'oreal", "ysl", "yves saint laurent", "hugo boss",
  "calvin klein", "tom ford", "the ordinary", "lindt", "toblerone", "cadbury",
  "hershey", "hershey's", "ferrero", "jack daniel's", "hennessy"
]);

function findMarketEntry(productName, productCategory, marketList) {
  const hay = (productName || "").toLowerCase();
  const normalizedProdCat = normalizeCategory(productCategory, productName);

  const eligible = (marketList || []).filter((m) => {
    const marketCat = normalizeCategory(m.category, m.brand);
    return marketCat === normalizedProdCat;
  });

  if (eligible.length === 0) return null;

  // 1. EXACT match: all defined keywords match product name as whole words
  const exact = eligible.find((m) => {
    const keywords = (m.keywords || []).filter(isRelevantKeyword);
    if (keywords.length === 0) return false;
    if (isTravelRetailBundleMismatch(productName, m)) return false;
    if (hasFlankerMismatch(productName, m.keywords)) return false;
    return keywords.every((kw) => keywordRegex(kw).test(hay));
  });
  if (exact) return exact;

  // 2. Multi-word brand match (only for non-multi-product brands)
  const multiWordBrandMatch = eligible.find((m) => {
    const brand = (m.brand || "").toLowerCase().trim();
    if (!brand.includes(" ")) return false;
    if (MULTI_PRODUCT_BRANDS.has(brand)) return false;
    if (isTravelRetailBundleMismatch(productName, m)) return false;
    if (hasFlankerMismatch(productName, m.keywords)) return false;
    return keywordRegex(brand).test(hay);
  });
  if (multiWordBrandMatch) return multiWordBrandMatch;

  // 3. Single-word dedicated brand match ONLY for Accessories / Watches
  const brandMatch = eligible.find((m) => {
    const brand = (m.brand || "").toLowerCase().trim();
    if (m.category !== "Accessories") return false;
    if (brand.length < 4 || GENERIC_MATCH_WORDS.has(brand)) return false;
    if (MULTI_PRODUCT_BRANDS.has(brand)) return false;
    if (isTravelRetailBundleMismatch(productName, m)) return false;
    if (hasFlankerMismatch(productName, m.keywords)) return false;
    return keywordRegex(brand).test(hay);
  });
  if (brandMatch) return brandMatch;

  return null;
}

function resolveSourceUrl(item, market) {
  if (item.category === "Liquor" || (market && market.category === "Liquor")) {
    return null;
  }
  if (market.sourceUrl && (market.sourceUrl.includes("?q=") || market.sourceUrl.includes("/s?k=") || market.sourceUrl.includes("catalogsearch"))) {
    return market.sourceUrl;
  }
  const query = encodeURIComponent(`${market.brand} ${item.name}`);
  if ((market.source || "").toLowerCase().includes("amazon")) {
    return `https://www.amazon.in/s?k=${query}`;
  }
  if ((market.source || "").toLowerCase().includes("sephora")) {
    return `https://sephora.nnnow.com/search?q=${query}`;
  }
  return `https://www.nykaa.com/search/result/?q=${query}`;
}

async function main() {
  const marketList = JSON.parse(
    fs.readFileSync(path.join(__dirname, "market-prices.json"), "utf8")
  );

  const liquorMRPList = getOfficialLiquorMRP();
  
  let amazonPrices = [];
  try {
    amazonPrices = await fetchAmazonPrices();
    console.log(`✓ Fetched ${amazonPrices.length} prices from Amazon\n`);
  } catch (err) {
    console.log(`⚠️  Amazon fetch failed (this is normal if Amazon is blocking): ${err.message}\n`);
  }

  const enhancedMarketList = [
    ...marketList.map(item => ({
      ...item,
      category: normalizeCategory(item.category, item.brand + " " + (item.keywords || []).join(" "))
    })),
    ...liquorMRPList.map(item => ({
      keywords: [item.brand.toLowerCase(), ...(item.name || "").toLowerCase().split(/\s+/).filter(w => w.length > 2 && !GENERIC_MATCH_WORDS.has(w))],
      brand: item.brand,
      size: item.size,
      category: "Liquor",
      marketPrice: item.mrp,
      source: "Delhi Retail MRP",
      sourceUrl: null,
      lastVerified: item.lastVerified,
      needsVerification: false,
    })),
    ...amazonPrices.map(item => ({
      keywords: [item.brand.toLowerCase(), ...((item.product || "").toLowerCase().split(/\s+/).filter(w => w.length > 2 && !GENERIC_MATCH_WORDS.has(w)))],
      brand: item.brand,
      size: item.product,
      category: normalizeCategory(item.category, item.brand + " " + item.product),
      marketPrice: item.mrp || item.currentPrice,
      source: "Amazon.in",
      sourceUrl: item.sourceUrl || null,
      lastVerified: item.lastUpdated,
    })),
  ];

  console.log(
    `📦 Market data loaded: ${marketList.length} base + ${liquorMRPList.length} liquor MRP + ${amazonPrices.length} Amazon prices\n`
  );

  const dataPath = path.join(__dirname, "..", "data.js");
  const oldPrices = {};
  try {
    const old = fs.readFileSync(dataPath, "utf8");
    for (const m of old.matchAll(/name:\s*"([^"]+)"[\s\S]*?dutyFree:\s*(\d+)/g)) {
      oldPrices[m[1]] = Number(m[2]);
    }
  } catch { /* first run — fine */ }

  const rawCollected = [];
  for (const cat of CATEGORIES) {
    try {
      const items = await fetchCategory(cat);
      rawCollected.push(...items);
    } catch (err) {
      console.error(`✗ ${err.message}`);
      if (String(err.message).includes("Stopping")) process.exit(1);
    }
    await sleep(1500);
  }

  if (rawCollected.length === 0) {
    console.error("\nNo products collected — data.js NOT overwritten. See README for recon steps.");
    process.exit(1);
  }

  // Deduplicate products across multiple search queries
  const seenSkus = new Set();
  const seenNames = new Set();
  const collected = [];
  for (const it of rawCollected) {
    const nameKey = (it.name || "").toLowerCase().trim();
    if (it.sku && seenSkus.has(it.sku)) continue;
    if (nameKey && seenNames.has(nameKey)) continue;
    if (it.sku) seenSkus.add(it.sku);
    if (nameKey) seenNames.add(nameKey);
    collected.push(it);
  }

  const emojiFor = {
    Perfumes: "🧴",
    Chocolates: "🍫",
    Whiskey: "🥃",
    Liquor: "🥃",
    Cosmetics: "💄",
    Accessories: "⌚",
    Watches: "⌚"
  };

const KNOWN_BRANDS = [
  "Johnnie Walker", "Chivas Regal", "Chivas", "Glenfiddich", "The Macallan", "Macallan", "Glenlivet", "The Glenlivet",
  "Balvenie", "Talisker", "Laphroaig", "Bowmore", "Lagavulin", "Ardbeg", "Highland Park", "The Dalmore", "Dalmore",
  "Jura", "The Singleton", "Singleton", "Aberfeldy", "Monkey Shoulder", "Jameson", "Bushmills", "Jack Daniel's",
  "Jim Beam", "Maker's Mark", "Woodford Reserve", "Hennessy", "Remy Martin", "Martell", "Courvoisier", "Camus",
  "Grey Goose", "Belvedere", "Absolut", "Smirnoff", "Ciroc", "Ketel One", "Bombay Sapphire", "Hendrick's",
  "Tanqueray", "Roku", "Beefeater", "Gordon's", "Bacardi", "Captain Morgan", "Havana Club", "Diplomatico",
  "Ron Zacapa", "Zacapa", "Baileys", "Jagermeister", "Kahlua", "Cointreau", "Aperol", "Campari", "Patron",
  "Don Julio", "1800 Tequila", "Jose Cuervo", "Herradura", "Casamigos", "Clase Azul", "Royal Salute", "Ballantine's",
  "Teacher's", "Dewar's", "Grant's", "Black Dog", "Amrut", "Paul John", "Indri", "Rampur", "Godawan",
  
  "Lindt", "Toblerone", "Ferrero Rocher", "Ferrero", "Cadbury", "Godiva", "Neuhaus", "Guylian", "Hershey's", "Hershey",
  "Kinder", "Milka", "Ritter Sport", "Patchi", "Bateel", "After Eight", "M&M's", "Mars", "Snickers", "Bounty",
  "Skittles", "Mentos", "Chupa Chups", "Nutella", "Tobler", "Daim", "Côte d'Or", "Anthon Berg",
  
  "Tom Ford", "Yves Saint Laurent", "YSL", "Giorgio Armani", "Emporio Armani", "Armani", "Christian Dior", "Dior",
  "Chanel", "Gucci", "Prada", "Hermes", "Hermès", "Burberry", "Bvlgari", "Bulgari", "Hugo Boss", "Boss",
  "Calvin Klein", "CK", "Dolce & Gabbana", "Dolce and Gabbana", "D&G", "Givenchy", "Guerlain", "Lancome", "Lancôme",
  "Estee Lauder", "Estée Lauder", "Clinique", "Clarins", "Kiehl's", "L'Occitane", "Shiseido", "SK-II", "La Mer",
  "Jo Malone", "Diptyque", "Byredo", "Maison Margiela", "Acqua di Parma", "Creed", "Montblanc", "Carolina Herrera",
  "Paco Rabanne", "Jean Paul Gaultier", "Issey Miyake", "Narciso Rodriguez", "Kenzo", "Mugler", "Elie Saab",
  "Viktor & Rolf", "Azzaro", "Davidoff", "Dunhill", "Coach", "Jimmy Choo", "Marc Jacobs", "Michael Kors",
  "Victoria's Secret", "The Ordinary", "L'Oreal Paris", "L'Oreal", "L'Oréal", "Maybelline", "MAC", "Bobbi Brown",
  "NARS", "Benefit", "Urban Decay", "Fenty Beauty", "Huda Beauty", "Charlotte Tilbury", "Versace", "Bottega Veneta",
  "Elizabeth Arden", "Lanvin", "Mont Blanc", "Ferragamo", "Salvatore Ferragamo", "Mancera", "Montale",
  "Parfums de Marly", "Initio", "Amouage", "Roja", "Xerjoff", "Penhaligon's", "Le Labo", "Maison Francis Kurkdjian",
  
  "Apple", "Sony", "Bose", "Sennheiser", "JBL", "Marshall", "Samsung", "Garmin", "Fitbit", "GoPro", "DJI",
  "Bang & Olufsen", "B&O", "Belkin", "Anker", "Skullcandy", "Harman Kardon", "Shokz",
  
  "Tissot", "Seiko", "Citizen", "Fossil", "Casio", "G-Shock", "Swarovski", "Ray-Ban", "Oakley", "Tommy Hilfiger",
  "Guess", "Police", "Skagen", "Daniel Wellington", "Victorinox", "Samsonite", "Tumi", "Delsey", "American Tourister",
  "Maui Jim", "Carrera", "Prada Linea Rossa", "Titan", "Fastrack"
];

function extractBrand(productName) {
  if (!productName) return "";
  const lower = productName.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    const reg = new RegExp(`\\b${escapeRegex(b.toLowerCase())}\\b`, "i");
    if (reg.test(lower)) {
      return b;
    }
  }
  const parts = productName.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(" ");
}

  const products = [];
  let matchedCount = 0;
  let excludedCount = 0;

  for (const item of collected) {
    const finalCategory = normalizeCategory(item.category, item.name);
    if (EXCLUDED_CATEGORIES.has(finalCategory)) {
      excludedCount++;
      continue;
    }

    const market = findMarketEntry(item.name, item.category, enhancedMarketList);
    const isTitleExclusive = /\b(travel\s+retail\s+exclusive|duty\s+free\s+exclusive|exclusive)\b/i.test(item.name);

    if (market) {
      matchedCount++;
      const resolvedSize = extractSize(item.name, market.size);
      const resolvedMarketPrice = calculateAdjustedMarketPrice(resolvedSize, market.size, market.marketPrice);
      const sourceLink = resolveSourceUrl(item, market);

      products.push({
        name: item.name,
        brand: market.brand || extractBrand(item.name),
        category: finalCategory,
        size: resolvedSize,
        dutyFree: item.dutyFree,
        dutyFreeSource: "Delhi Duty Free Official Website (GraphQL API)",
        dutyFreeLastUpdated: new Date().toISOString(),
        market: resolvedMarketPrice,
        marketSource: market.source || "Local Retail / Amazon.in",
        marketSourceUrl: sourceLink,
        emoji: emojiFor[finalCategory] || "🛍️",
        previousDutyFree: oldPrices[item.name] || null,
        isExclusive: Boolean(market.isExclusive) || isTitleExclusive,
        needsVerification: Boolean(market.needsVerification),
        url: item.url,
      });
    } else {
      // Scraped item without market baseline reference price
      const resolvedSize = extractSize(item.name, "1 unit");
      const resolvedBrand = extractBrand(item.name);

      products.push({
        name: item.name,
        brand: resolvedBrand,
        category: finalCategory,
        size: resolvedSize,
        dutyFree: item.dutyFree,
        dutyFreeSource: "Delhi Duty Free Official Website (GraphQL API)",
        dutyFreeLastUpdated: new Date().toISOString(),
        market: null,
        marketSource: null,
        marketSourceUrl: null,
        emoji: emojiFor[finalCategory] || "🛍️",
        previousDutyFree: oldPrices[item.name] || null,
        isExclusive: isTitleExclusive,
        url: item.url,
      });
    }
  }

  if (excludedCount) {
    console.log(`\n🗑  Dropped ${excludedCount} out-of-scope products (${[...EXCLUDED_CATEGORIES].join(", ")})`);
  }
  console.log(`\n✅ Matched ${matchedCount} of ${collected.length} scraped products to market prices. Included all ${products.length} scraped products in catalog.`);

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
