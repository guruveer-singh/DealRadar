# 4. Functions and APIs

## Browser functions in `app.js`

- `rupees(n)`: formats a number using Indian thousands separators.
- `timeAgo(isoString)`: converts an ISO timestamp into text such as `5 min ago`.
- `withStats(p)`: calculates `savings`, `savingsPct`, `dealScore`, and `priceChange`.
- `scoreTier(score)`: maps a score to `Great deal`, `Good deal`, or `Okay`.
- `cardHTML(p)`: returns the HTML string for one product card.
- `render()`: filters, searches, sorts, and renders the current product list.
- `clearSearch()`: empties the search input and renders again.
- `buildCategoryButtons()`: creates category buttons and their click handlers.
- `showFreshness()`: reads `DATA_SOURCE` and `LAST_UPDATED` to show status.

## Collector functions in `collector.js`

- `productQuery(searchTerm)`: creates the Magento GraphQL query string.
- `sleep(ms)`: pauses between requests.
- `fetchCategory(cat)`: POSTs a category search to DDF, checks errors, and maps API items into local objects.
- `findMarketEntry(productName, marketList)`: returns the first entry whose keywords all occur in the product name.
- `main()`: runs the entire pipeline and writes `data.js`.

## Amazon functions in `amazon-scraper.js`

- `fetchAmazonPrices()`: loops through `PRODUCTS_TO_TRACK`, fetches each public search page, extracts prices, and returns results.
- The module also exports `PRODUCTS_TO_TRACK` so another script can inspect the configured searches.

## Excise functions in `liquor-mrp-fetcher.js`

- `getOfficialLiquorMRP()`: returns a copied list of liquor records with a note.
- `verifyMRPWithLivingLiquidz(productName)`: placeholder; currently logs TODO and returns `null`.
- `formatForCollector()`: returns liquor records in the same keyword/market-price shape, but the active collector currently builds its own mapping instead.

## API call 1: Delhi Duty Free GraphQL

Endpoint:

```text
POST https://www.delhidutyfree.co.in/graphql
```

Headers include `Content-Type: application/json`, `Accept: application/json`, and a browser-like `User-Agent`.

Body shape:

```json
{"query":"{ products(search: \"perfume OR fragrance\", pageSize: 50, currentPage: 1) { total_count items { name sku url_key categories { name url_path } price_range { minimum_price { final_price { value currency } } } } } }"}
```

The response is expected to contain `data.products.items`. Each item provides the product name, SKU, categories, URL key, and final price.

The collector makes one request per category in `CATEGORIES`, waits two seconds between category requests, and stops if DDF returns HTTP 403 or 429.

## API call 2: Amazon public search

Endpoint pattern:

```text
GET https://www.amazon.in/s?k=<encoded search term>
```

The scraper reads the returned HTML as text and applies regular expressions looking for `Price` and `M.R.P` followed by rupee values. This is not a stable official API. Amazon can change the HTML or block automated access.

The current scraper tracks five searches. Adding an Amazon product requires adding an object to `PRODUCTS_TO_TRACK`; it does not automatically discover the entire catalog.

## No API call: liquor data

`liquor-mrp-fetcher.js` currently returns an in-code array. It does not fetch the Excise Board. The source URL is attribution/documentation, not proof that the script verified the value during the run.

## No API call: market catalog

`market-prices.json` is read from disk. It is not automatically refreshed.
