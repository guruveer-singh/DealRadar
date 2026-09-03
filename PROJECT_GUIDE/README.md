# DealRadar Project Guide

This folder explains the project for a complete beginner. Read the files in this order:

1. `01_START_HERE.md` - what the app does and how to run it.
2. `02_BIG_PICTURE.md` - how the browser, collector, files, and APIs connect.
3. `03_FILE_MAP.md` - every project file and its responsibility.
4. `04_FUNCTIONS_AND_APIS.md` - each important function and every network call.
5. `05_DATA_AND_MATCHING.md` - product data shape, keywords, prices, and matching.
6. `06_COMMANDS.md` - commands to run, test, and inspect the project.
7. `07_TROUBLESHOOTING.md` - common errors and what they mean.
8. `08_SAFE_NEXT_STEPS.md` - improvements to make after understanding the current code.

## Important truth about the current data

- Delhi Duty Free prices are fetched live by `collector/collector.js`.
- Amazon prices are best-effort prices from public search pages and may be blocked or inaccurate.
- Liquor prices in `collector/liquor-mrp-fetcher.js` are manually recorded Delhi baseline values and need verification against the latest official excise document.
- Most non-liquor catalog prices in `collector/market-prices.json` are reference values. They are not automatically verified by the collector.
- `data.js` is generated output. Do not edit it by hand; run the collector instead.

## Current learning path

Start by opening `01_START_HERE.md`, then run the commands shown there. After each command, compare the output with the explanation in the next guide file.
