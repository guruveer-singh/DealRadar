# 8. Safe Next Steps

Work through these in order:

1. Add a real source URL and verification date to every manually maintained catalog entry.
2. Replace Amazon HTML scraping with an approved Amazon Product Advertising API or another permitted provider.
3. Move liquor MRP values from JavaScript into a dated source file imported by the collector.
4. Add a small test suite for keyword matching, savings calculations, and malformed source responses.
5. Add pagination if you need more than the first 50 DDF products per category.
6. Add a cache so one blocked source does not erase previously known good market prices.
7. Add a GitHub Actions workflow only after source permissions, secrets, and rate limits are documented.
8. Update the root README and footer, which still contain older V1/sample-data wording.

## Best first coding exercise

Change one keyword entry, validate JSON, run the collector, and observe the matched count. Then open `data.js` and trace one product back through:

`data.js` -> `collector.js` -> `findMarketEntry()` -> `market-prices.json`.

That single trace teaches the main data path without changing the UI.
