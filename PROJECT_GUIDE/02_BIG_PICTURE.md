# 2. Big Picture

## Complete data flow

```text
Amazon public search pages ----\
                                \
Delhi Excise reference ----------> collector.js ---> data.js ---> index.html ---> app.js ---> browser cards
                                /
Delhi Duty Free GraphQL API ----/

market-prices.json ------------/
```

## Startup flow in the browser

`index.html` contains empty locations such as `#grid`, `#categories`, `#count`, and `#updated`.

`data.js` runs first and creates:

- `LAST_UPDATED`
- `DATA_SOURCE`
- `DATA_ATTRIBUTION`
- `PRODUCTS`

`app.js` runs second:

1. `PRODUCTS.map(withStats)` adds savings, percentage, score, and price change.
2. `buildCategoryButtons()` creates category filters.
3. `showFreshness()` displays live/sample status.
4. `render()` applies filters and sorting, then inserts product-card HTML.
5. Search and sort event listeners call `render()` again.

## Collector flow

`collector.js` is the orchestrator. It owns the sequence, not the raw source data.

1. Import `getOfficialLiquorMRP()` from `liquor-mrp-fetcher.js`.
2. Import `fetchAmazonPrices()` from `amazon-scraper.js`.
3. Load base catalog entries from `market-prices.json`.
4. Fetch each object in `CATEGORIES` using `fetchCategory()`.
5. Combine all market lists into `enhancedMarketList`.
6. For each fetched DDF item, call `findMarketEntry()`.
7. Keep only matched products.
8. Serialize the result as JavaScript in `data.js`.

## Why unmatched products disappear

The collector intentionally creates a comparison list, not a full DDF inventory. If no catalog entry has all of its keywords inside a fetched product name, that product is skipped. Add or adjust keywords in `market-prices.json` when a legitimate product is missing.

## Price source meaning

`dutyFree` is the live DDF price. `market` is the first matching market entry. The source fields tell the UI or a future feature where that market value came from.
