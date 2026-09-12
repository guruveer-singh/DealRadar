# DealRadar ✈️ — Delhi Duty Free Price Comparison

[![GitHub Actions Workflow](https://github.com/guruveer-singh/DealRadar/actions/workflows/update-prices.yml/badge.svg)](https://github.com/guruveer-singh/DealRadar/actions/workflows/update-prices.yml)

A real-time price comparison tool that helps travelers decide: **"Is this really cheaper at Delhi Duty Free, or should I buy it locally?"**

## 🎯 What It Does

DealRadar compares prices between:
- **Delhi Duty Free** (live prices from official GraphQL API)
- **Indian Market** (Amazon.in, Delhi Excise MRP, retail aggregators)

For each product, it shows:
- Side-by-side price comparison
- Exact savings amount (₹)
- Savings percentage
- **Deal Score** (0-100) — higher is better

## 🚀 Quick Start

**No installation required. No database. No backend.**

1. Clone the repository
2. Open `index.html` in your browser
3. That's it! Compare prices instantly

```bash
git clone https://github.com/guruveer-singh/DealRadar.git
cd DealRadar
# Open index.html in your browser
```

## 📊 Data Status

Counts change on every run, so they are deliberately not duplicated here — a
number written into a README is stale within a day. Instead:

- The **site header** shows when the prices were last refreshed.
- The **Actions badge** above shows whether the latest scheduled run succeeded.
- The **category chips** on the site show a live count per category.

- **Update Frequency:** Daily (automated, early morning UTC)

### Categories

| Category | Examples |
|----------|----------|
| **Perfumes** | Dior, Chanel, Tom Ford, Armani |
| **Liquor** | Johnnie Walker, Macallan, Chivas |
| **Chocolates** | Lindt, Toblerone, Ferrero |
| **Cosmetics** | Clinique, Lancome, Estee Lauder |
| **Accessories** | GC Watches, Ray Ban |

> **Catalog scope:** perfumes, liquor, chocolates, cosmetics and accessories.
> Electronics and beverages are deliberately out of scope and excluded by the
> collector — see `EXCLUDED_CATEGORIES` in `collector/collector.js`.

## 🔧 How It Works

### Data Collection

The project uses a Node.js collector (`collector/collector.js`) that:

1. **Fetches live prices** from Delhi Duty Free's official GraphQL API
2. **Matches products** against market price database
3. **Normalizes sizes** (e.g., 1L duty-free vs 750ml domestic)
4. **Calculates savings** and deal scores
5. **Generates `data.js`** with all product information

### Automated Updates

GitHub Actions workflow is scheduled daily via:

```yaml
schedule:
  - cron: "0 6 * * *"  # 06:00 UTC
```

- ✅ Automatically fetches latest prices
- ✅ Commits refreshed `data.js` to the repository
- ℹ️ GitHub may delay scheduled runs under load, so the commit typically lands
  a few hours after 06:00 UTC rather than exactly on time.

### Deployment (Netlify)

The daily data commit is wired to reach the live site automatically:

- `netlify.toml` builds a `dist/` directory containing only the four static
  files the site needs (`index.html`, `app.js`, `style.css`, `data.js`).
- `build-site.js` performs that copy.
- Link the Netlify site to this repository (*Site configuration → Build &
  deploy → Link repository*, branch `main`). Once linked, every commit —
  including the daily automated one — triggers a production deploy.

No build-time dependencies are required: the collector uses Node's built-in
`fetch`.

### Deal Score Formula

```
savings = market_price - duty_free_price
savings_percent = (savings / market_price) × 100
deal_score = savings_percent × 2.5 (capped at 100)
```

- **Score 80-100:** Excellent deal (≥32% savings)
- **Score 60-79:** Good deal (24-31% savings)
- **Score 0-59:** Fair deal (<24% savings)

## 📁 Project Structure

```
DealRadar/
├── index.html          # Main web interface
├── app.js              # Frontend logic (search, filter, render)
├── style.css           # Dark theme styling
├── data.js             # Auto-generated product database
├── collector/          # Data collection scripts
│   ├── collector.js    # Main orchestrator
│   ├── market-prices.json  # Market price catalog
│   ├── liquor-mrp-fetcher.js  # Delhi Excise MRP data
│   └── amazon-scraper.js     # Amazon.in price fetcher
├── PROJECT_GUIDE/      # Comprehensive documentation
└── .github/workflows/  # GitHub Actions automation
    └── update-prices.yml
```

## 🔄 Manual Price Update

To update prices manually:

```bash
cd collector
node collector.js
```

The collector will:
- Fetch latest Delhi Duty Free prices (about a minute)
- Match against market prices
- Update `data.js` with fresh data
- Display summary of products fetched

## 📈 Features

### Current Features (V2)

- ✅ **Live price tracking** from Delhi Duty Free API
- ✅ **Five categories** — perfumes, liquor, chocolates, cosmetics, accessories
- ✅ **Deal Score** with visual indicators
- ✅ **Search & filter** by brand, category, name
- ✅ **Sort options** (best deal, savings, price, name)
- ✅ **Daily automated updates** via GitHub Actions
- ✅ **Market price matching** wherever a reliable baseline exists
- ✅ **Price change tracking** (previous vs current)
- ✅ **Data source attribution** for transparency

### Planned Features (Roadmap)

- 🔜 **Price history charts** — track price changes over time
- 🔜 **Price alerts** — get notified when prices drop
- 🔜 **Budget planner** — "I have ₹10,000, what should I buy?"
- 🔜 **Trip planning** — save products for your next trip
- 🔜 **Mobile app** — native iOS/Android apps
- 🔜 **Browser extension** — compare while shopping online

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **Data Collection:** Node.js (built-in `fetch`)
- **API:** Delhi Duty Free GraphQL API
- **Automation:** GitHub Actions
- **Data Sources:**
  - Delhi Duty Free (official GraphQL API)
  - Amazon.in (public search results)
  - Delhi Excise Board (official MRP)

## 📊 Data Sources & Attribution

All prices include source attribution:

```javascript
{
  "dutyFreeSource": "Delhi Duty Free Official Website (GraphQL API)",
  "marketSource": "Amazon.in / Delhi Excise Board",
  "dutyFreeLastUpdated": "2026-09-12T12:29:53.783Z"
}
```

### Data Accuracy

- **Duty Free Prices:** Live and accurate (from official API)
- **Market Prices:** 
  - Liquor: Official Delhi Excise MRP
  - Other: Amazon.in / retail aggregators (may vary by ±10%)

## 🤝 Contributing

Contributions welcome! Areas to help:

1. **Add more products** to `collector/market-prices.json`
2. **Improve matching logic** in `collector/collector.js`
3. **Fix bugs** in frontend (`app.js`, `style.css`)
4. **Add features** from the roadmap
5. **Report issues** with specific products or brands

## 📝 License

MIT License — use freely for personal or commercial projects.

## 🔗 Links

- **Live Demo:** Open `index.html` locally
- **Repository:** https://github.com/guruveer-singh/DealRadar
- **Actions:** https://github.com/guruveer-singh/DealRadar/actions
- **Issues:** https://github.com/guruveer-singh/DealRadar/issues

## 📞 Support

- **Documentation:** See `PROJECT_GUIDE/` folder
- **Issues:** Open a GitHub issue
- **Questions:** Check `PROJECT_GUIDE/07_TROUBLESHOOTING.md`

---

**Built with ❤️ for travelers who want to shop smarter at Delhi Duty Free**