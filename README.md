# DealRadar ✈️ — Delhi Duty Free Price Comparison

[![GitHub Actions Workflow](https://github.com/guruveer-singh/DealRadar/actions/workflows/update-prices.yml/badge.svg)](https://github.com/guruveer-singh/DealRadar/actions/workflows/update-prices.yml)
[![Last Updated](https://img.shields.io/badge/Updated-September%2011%2C%2026-brightgreen)](https://github.com/guruveer-singh/DealRadar)
[![Products](https://img.shields.io/badge/Products-1%2C266-blue)](https://github.com/guruveer-singh/DealRadar)

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

## 📊 Current Data Status

- **Total Products:** 1,266
- **Market Price Matches:** 447 (35%)
- **Duty Free Exclusives:** 819 (65%)
- **Last Updated:** September 11, 2026, 6:07 PM IST
- **Update Frequency:** Daily at 11:30 AM IST (automated)

### Categories

| Category | Products | Examples |
|----------|----------|----------|
| **Perfumes** | 257+ | Dior, Chanel, Tom Ford, Armani |
| **Liquor** | 337+ | Johnnie Walker, Macallan, Chivas |
| **Chocolates** | 446+ | Lindt, Toblerone, Ferrero |
| **Cosmetics** | 95+ | Clinique, Lancome, Estee Lauder |
| **Accessories** | 62+ | GC Watches, Ray Ban |
| **Beverages** | 131+ | Coffee, Tea collections |

## 🔧 How It Works

### Data Collection

The project uses a Node.js collector (`collector/collector.js`) that:

1. **Fetches live prices** from Delhi Duty Free's official GraphQL API
2. **Matches products** against market price database
3. **Normalizes sizes** (e.g., 1L duty-free vs 750ml domestic)
4. **Calculates savings** and deal scores
5. **Generates `data.js`** with all product information

### Automated Updates

GitHub Actions workflow runs daily at 06:00 UTC (11:30 AM IST):

```yaml
schedule:
  - cron: "0 6 * * *"  # Daily at 06:00 UTC
```

- ✅ Automatically fetches latest prices
- ✅ Commits updated data to repository
- ✅ 100% success rate (9/9 runs successful)

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
- Fetch latest Delhi Duty Free prices (~5-10 minutes)
- Match against market prices
- Update `data.js` with fresh data
- Display summary of products fetched

## 📈 Features

### Current Features (V2)

- ✅ **Live price tracking** from Delhi Duty Free API
- ✅ **1,266 products** across 6 categories
- ✅ **Deal Score** with visual indicators
- ✅ **Search & filter** by brand, category, name
- ✅ **Sort options** (best deal, savings, price, name)
- ✅ **Daily automated updates** via GitHub Actions
- ✅ **Market price matching** for 447 products
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
- **Data Collection:** Node.js, Playwright (for scraping)
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
  "lastUpdated": "2026-09-11T18:07:42.703Z"
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

*Last updated: September 11, 2026*