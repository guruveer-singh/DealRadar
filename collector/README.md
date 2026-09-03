# DealRadar Collector (V2)

Automatically fetches Delhi Duty Free prices and rewrites `../data.js`,
so the webapp always shows fresh prices.

```
Collector (this) ──writes──▶ data.js ──read by──▶ index.html
```

## Run it

```
cd collector
node collector.js
```

Then just refresh `index.html` in the browser — header flips to
**🟢 Live prices · updated just now**.

## How it works

Delhi Duty Free runs on **Magento**, a common e-commerce platform.
Magento stores expose a `/graphql` endpoint that the site's own frontend
uses to load products — we ask it the same question the website asks itself.
No HTML scraping, no headless browser needed.

- **Duty-free prices** → fetched automatically from the site
- **Market prices** → maintained by hand in `market-prices.json` (for now).
  Each entry has `keywords` used to match scraped product names, since
  names never match exactly ("Sauvage EDT" vs "Dior Sauvage Eau de Toilette").

Products that can't be matched to a market price are skipped —
the app is a *curated comparison*, not a raw product dump.

## If the category slugs are wrong (first-run recon)

The `CATEGORIES` list at the top of `collector.js` guesses url-keys like
`perfumes` / `chocolates` / `whisky`. To find the real ones:

1. Open https://www.delhidutyfree.co.in in Chrome
2. Click a category, look at the URL — e.g. `/fragrances.html` → url_key is `fragrances`
3. Update `CATEGORIES` in `collector.js`

**Bonus recon (to see the API live):** DevTools (F12) → Network tab →
filter "graphql" → click any category on the site → click a request →
Preview tab. That JSON is exactly what the collector consumes.

## Be a good citizen 🤝

This collector is deliberately gentle:

- 1 small request per category, 2-second pauses
- Runs only when *you* run it (a few times a day max)
- Stops immediately if the site returns 403/429

That's about the same load as one person browsing the site.
Don't run it in a loop, don't crank up `pageSize`, don't parallelize it.
This is an educational project — keep it that way.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `GraphQL error ... category` | Wrong category slug | Recon steps above |
| `HTTP 403` | Bot protection (e.g. Cloudflare) | See "If GraphQL is blocked" below |
| `Matched 0 of N` | Keywords too strict | Loosen `keywords` in market-prices.json |

### If GraphQL is blocked entirely

Some Magento stores put Cloudflare in front of everything. If every request
gets 403 even in small volumes, the honest options are:

1. Use DevTools to copy the JSON response by hand into a file, and point the
   collector at that file (semi-automated — still beats retyping prices).
2. Playwright (real browser automation) — heavier, but looks like a real visitor.

Don't try to defeat bot protection with header tricks — that crosses from
"educational project" into "violating their terms".
