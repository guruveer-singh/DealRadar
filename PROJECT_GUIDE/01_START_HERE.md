# 1. Start Here

## What is this project?

DealRadar compares a Delhi Duty Free price with a market reference price. It calculates savings and shows products in a browser page.

There are two parts:

- **Web app:** HTML, CSS, and browser JavaScript. It reads `data.js` and displays cards.
- **Collector:** Node.js scripts. They fetch fresh Duty Free data, combine it with market data, and rewrite `data.js`.

## First run: open the app

From the project folder, double-click `index.html`.

The browser loads files in this order:

1. `index.html` creates the page elements.
2. `style.css` styles those elements.
3. `data.js` defines `PRODUCTS` and update metadata.
4. `app.js` reads `PRODUCTS`, calculates deal statistics, and fills the page.

## Refresh live data

Open PowerShell in the project folder and run:

```powershell
Set-Location ".\collector"
node collector.js
```

Then refresh `index.html` in the browser.

The collector does this:

1. Reads `market-prices.json`.
2. Reads the manually maintained liquor list.
3. Requests product pages through the Delhi Duty Free GraphQL API.
4. Requests five configured Amazon searches.
5. Matches fetched product names to catalog keywords.
6. Writes the matching products to `..\data.js`.

## What to learn first

- A **file** stores code or data.
- A **function** is a named block of code that performs one job.
- An **API** is a web endpoint that accepts a request and returns data.
- `require()` imports Node.js code from another file.
- `module.exports` makes functions available to another Node.js file.
- `fetch()` sends an HTTP request.

Do not edit `data.js` first. Edit the source file that owns the behavior, then regenerate the output.
