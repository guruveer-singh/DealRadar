# 3. File Map

## Root files

### `index.html`
The page shell. It defines the title, search input, sort dropdown, category container, product grid, statistics, and script order.

### `style.css`
All visual styling: colors, layout, controls, category chips, cards, prices, and responsive behavior. It contains no data-fetching logic.

### `app.js`
Browser behavior. It calculates deal scores, filters products, sorts products, creates card HTML, updates counts, and displays freshness.

Functions: `rupees`, `timeAgo`, `withStats`, `scoreTier`, `cardHTML`, `render`, `clearSearch`, `buildCategoryButtons`, `showFreshness`.

### `data.js`
Generated database-like output. It contains the latest product array and attribution. The collector overwrites it.

### `package.json`
Lists the Node dependency currently declared: Playwright. The current fetch-based Amazon script uses Node's built-in `fetch`, so Playwright is not required by the active code.

### `package-lock.json`
Generated dependency lock file. Do not hand-edit it.

### `README.md`
Original short project description. Some wording describes the older sample-data version; this `PROJECT_GUIDE` documents the current collector.

### `DATA_SOURCING.md`
Data-source policy and attribution notes. Read it before claiming that a price is official or live.

## Collector files

### `collector/collector.js`
Main pipeline. Defines categories, creates the DDF GraphQL query, fetches DDF products, combines sources, matches names, and writes `data.js`.

### `collector/amazon-scraper.js`
Best-effort Amazon public search reader. It searches the five objects in `PRODUCTS_TO_TRACK`, extracts current price and MRP with regular expressions, and returns result objects.

### `collector/liquor-mrp-fetcher.js`
Stores Delhi liquor reference values and source metadata. `getOfficialLiquorMRP()` returns those records. The values are manual and must be kept current.

### `collector/market-prices.json`
The main catalog. Each entry has `keywords`, `brand`, `size`, `marketPrice`, and `category`. It currently has 65 entries across seven categories.

### `collector/sources.js`
Informational configuration describing intended primary and backup sources. It is not imported by the active collector.

### `collector/test-api.js`
Small diagnostic script for testing DDF product search and category API responses. It does not write `data.js`.

### `collector/README.md`
Older collector notes. It still mentions category slugs in places, while the active collector uses search terms. Prefer the code and this guide for current behavior.

## Generated and ignored content

`node_modules/` contains installed packages and should not be edited. It is normally recreated with `npm install`.

## Files that do not exist yet

There is currently no GitHub Actions workflow, database, backend server, automated test suite, or browser build system. The app is static and the collector is a standalone Node script.
