# 7. Troubleshooting

## The browser says Sample data

Check that `data.js` exists and is loaded before `app.js` in `index.html`. Run the collector again and refresh the browser.

## The browser shows no cards

Open Developer Tools with F12 and check the Console. Common causes are a syntax error in `data.js` or a missing element ID in `index.html`.

## `Matched 0 of N`

The DDF request worked, but names did not match catalog keywords. Copy a real product name from the collector output or DDF, then add distinctive keywords to `market-prices.json`.

## Amazon returns 403, 503, or no prices

Amazon blocks automation and changes HTML. The collector continues with the base catalog and liquor records. Treat Amazon as optional until an approved API or permitted provider is connected.

## DDF returns 403 or 429

The collector intentionally stops. Do not loop or aggressively retry. Wait, confirm the site is available in a normal browser, and respect the site's terms.

## GraphQL error

Run `node test-api.js`. If search works but a new category fails, check the search string in `CATEGORIES`. The active implementation uses the `search` argument, not category URL filters.

## `fetch is not defined`

Use a current Node.js version with built-in fetch. Check it with:

```powershell
node --version
```

Use Node 18 or newer for the current scripts.

## JSON parse error

The catalog must contain double-quoted JSON keys and strings, commas between objects, and no trailing JavaScript comments. Run the validation command in `06_COMMANDS.md`.

## Prices look wrong

Check the source fields in `data.js`. Amazon extraction is heuristic, base catalog values are manually maintained, and liquor values are manually recorded references. Do not label a value official without checking the source document.

## `node_modules` problem

Delete and reinstall only when necessary:

```powershell
Remove-Item -Recurse -Force ".\node_modules"
npm install
```

This is not normally needed for the current built-in-fetch collector.
