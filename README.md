# DealRadar ✈️ — Duty Free vs Market Price (V1)

A small web app that answers one question travellers actually ask:
**"Is this really cheaper at Delhi Duty Free, or am I being fooled?"**

For each product it shows the **Duty Free price** vs the **Indian market price**,
calculates how much you save, and gives it a **Deal Score (0–100)** so the best
buys float to the top.

## How to run

No installation. No accounts. No database.

1. Open the `DutyFreeProject` folder.
2. Double-click **`index.html`** — it opens in your browser. That's it.

## Features (V1)

- 18 products across **Perfumes**, **Chocolates**, **Whiskey**
- **Deal Score** + "Great / Good / Okay" rating
- **Search** by product or brand
- **Filter** by category
- **Sort** by best deal / most rupees saved / lowest price
- Live "total you'd save" headline

## Files

| File         | What it does                                            |
| ------------ | ------------------------------------------------------- |
| `index.html` | The page structure                                      |
| `style.css`  | The look (dark theme, cards)                             |
| `data.js`    | The product list — the "database" for now               |
| `app.js`     | The logic: deal score, search, filter, sort, drawing    |

## Deal Score, explained

```
savings     = market price − duty free price
savings %    = savings ÷ market price × 100
Deal Score   = savings % × 2.5   (capped at 100)
```
So a product that's 40% cheaper at duty free scores a perfect 100.

## Roadmap (where this grows)

- **V2 – Real data:** replace the hand-typed `data.js` with a small script
  (Node.js) that fetches prices, so the app updates itself. The rest of the
  app doesn't change — only the data *source* does.
- **V2.5 – Price history:** store prices over time, show if a deal is getting
  better or worse.
- **V3 – Shopping Advisor:** enter a budget, get "buy these 5 things, save ₹X".

> Prices in V1 are **illustrative sample data** for building and demoing the app.
