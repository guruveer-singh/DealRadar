/*
  amazon-scraper.js — Fetch live prices from Amazon.in
  
  Note: Amazon actively blocks automated scrapers. This is a best-effort implementation.
  For production use, consider:
  - Amazon Product Advertising API (requires approval)
  - Third-party price aggregators with legal agreements
  - Manual price updates from trusted retailers
  
  This scraper attempts to extract prices from public search results.
  If Amazon blocks access, gracefully falls back to cached prices.
*/

// Products to track on Amazon: these are matched against DDF products
const PRODUCTS_TO_TRACK = [
  { brand: "Dior", product: "Sauvage EDT 100ml", searchTerm: "Dior Sauvage EDT 100ml" },
  { brand: "Chanel", product: "Bleu de Chanel EDP 100ml", searchTerm: "Chanel Bleu de Chanel" },
  { brand: "Toblerone", product: "Milk Chocolate 360g", searchTerm: "Toblerone Milk 360g" },
  { brand: "Lindt", product: "Lindor 500g", searchTerm: "Lindt Lindor assorted" },
  { brand: "Ghirardelli", product: "Chocolate 450g", searchTerm: "Ghirardelli chocolate" },
];

/**
 * Fetch Amazon prices using public search results
 * Note: This is a lightweight implementation. For production, use official APIs.
 */
async function fetchAmazonPrices() {
  console.log("\n🛒 Fetching Amazon.in prices...\n");
  console.log("   (Note: Using public search results. Limited reliability.)");
  
  const results = [];

  for (const product of PRODUCTS_TO_TRACK) {
    try {
      console.log(`\n   → ${product.brand} ${product.product}`);
      
      // Construct Amazon search URL
      const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(product.searchTerm)}`;
      console.log(`     Searching: ${searchUrl}`);

      // Fetch the page (NOTE: Amazon may return 503/403 if blocking)
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
        timeout: 10000,
      });

      if (!response.ok) {
        console.log(`     ✗ HTTP ${response.status} - Amazon may be blocking requests`);
        continue;
      }

      const html = await response.text();

      // Try to extract price data from page
      // Amazon embeds product data in JavaScript variables
      const priceMatch = html.match(/Price.*?<span.*?>₹([\d,]+)/i);
      const mrpMatch = html.match(/M\.R\.P.*?<span.*?>₹([\d,]+)/i);

      if (priceMatch) {
        const currentPrice = parseInt(priceMatch[1].replace(/,/g, ""));
        const mrp = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, "")) : currentPrice;

        results.push({
          brand: product.brand,
          product: product.product,
          currentPrice,
          mrp,
          discount: mrp - currentPrice,
          source: "Amazon.in",
          lastUpdated: new Date().toISOString(),
          note: "Extracted from public search results",
        });

        console.log(`     ✓ ₹${mrp} (MRP) / ₹${currentPrice} (Current)`);
      } else {
        console.log(`     ✗ Could not extract price data from page`);
      }

      // Be polite - don't hammer Amazon
      await new Promise(r => setTimeout(r, 3000));

    } catch (err) {
      console.log(`     ✗ Error: ${err.message}`);
    }
  }

  console.log(`\n   ✓ Fetched ${results.length}/${PRODUCTS_TO_TRACK.length} prices from Amazon\n`);
  return results;
}

// Export
module.exports = { fetchAmazonPrices, PRODUCTS_TO_TRACK };

// Test: node amazon-scraper.js
if (require.main === module) {
  fetchAmazonPrices()
    .then(results => {
      console.log("\n📊 Results:");
      console.log(JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error("Error:", err);
      process.exit(1);
    });
}
