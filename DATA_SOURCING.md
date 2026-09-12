---
title: Data Sourcing Strategy - DDF PriceCheck
date: 2026-09-03
---

# Data Sourcing Strategy

## Problem with Current Setup
✗ Market prices are **hardcoded** with no source attribution  
✗ No way to verify accuracy or update frequency  
✗ Users can't trust where prices come from  

## Solution: Verified Official Sources Only

### 1. DUTY FREE PRICES ✅ (Already Working)
**Source:** Delhi Duty Free official website (GraphQL API)  
**Reliability:** Live, official, real-time  
**Frequency:** Daily (via collector.js)  
**Attribution:** ✓ Clearly documented  

```
GET https://www.delhidutyfree.co.in/graphql
→ Fetches products across perfumes, liquor, chocolates, cosmetics, accessories
→ Real prices with currency
```

Counts are deliberately not written down here — they change with every daily
run. The site's category chips show the live figure.

---

### 2. AMAZON PRICES ❌→ TODO
**Source:** Amazon.in (official MRP + selling price)  
**Reliability:** Official retail pricing  
**Frequency:** Daily scrape needed  
**Attribution:** Need to add source tracking  

**Implementation Plan:**
```
collector/amazon-scraper.js
├─ Search for each product on Amazon.in
├─ Extract MRP (printed price) + current selling price
├─ Store both (MRP is "market price", selling price is "discounted")
├─ Built-in fetch — no browser automation (see note below)
└─ Run daily with 2s delay between requests
```

**Status:** ⚠️ Needs setup + testing

---

### 3. LIQUOR MRP ❌→ TODO (Fixed Prices)
**Source:** Delhi Excise Board (official fixed prices)  
**Important:** Liquor MRP = actual retail price (NO discounts allowed in India)  
**Reliability:** Government fixed  
**Frequency:** Update only when excise changes (quarterly checks)  

**Implementation Plan:**
```
collector/liquor-mrp-fetcher.js
├─ Maintain official Delhi MRP list (JSON)
├─ Update quarterly when excise board announces changes
├─ Add source link to each item
└─ Fallback: Cross-check with LivingLiquidz.com (community pricing)

Sources to monitor:
- https://delhi.gov.in/service/excise (official)
- https://www.livingliquidz.com (community-sourced, verified)
```

**Status:** ✓ Skeleton created, needs official data

---

### 4. PERFUME & CHOCOLATE PRICES ❌→ TODO
**Source:** Amazon.in + Nykaa.com (retail MRP)  
**Reliability:** Official retailer pricing  
**Frequency:** Daily  

**Implementation Plan:**
```
collector/amazon-scraper.js + nykaa-scraper.js
├─ Search for product on Amazon + Nykaa
├─ Extract MRP from packaging image or listing
├─ Compare prices across platforms
├─ Use highest MRP as "market price" (that's ACTUAL retail)
└─ Run daily
```

**Status:** ⚠️ Skeleton exists, needs expansion

---

## Data Attribution Format

Each product in `data.js` should include:

```javascript
{
  name: "Absolut Vodka",
  brand: "Absolut",
  category: "Liquor",
  size: "1 L",
  
  // Duty Free (Live)
  dutyFree: 2420,
  dutyFreeSource: "delhidutyfree.co.in GraphQL API",
  dutyFreeLastUpdated: "2026-09-03T10:50:02Z",
  
  // Market Price (Manual or Scraped)
  market: 2600,
  marketSource: "Delhi Excise Board Official MRP",
  marketLastUpdated: "2026-09-01",
  marketSourceUrl: "https://delhi.gov.in/service/excise",
  
  // Extra info
  emoji: "🛍️",
  url: "https://www.delhidutyfree.co.in/absolut-vodka.html"
}
```

---

## Implementation Roadmap

### Phase 1: Documentation ✅
- [x] Create sources.js (strategy document)
- [x] Create amazon-scraper.js (skeleton)
- [x] Create liquor-mrp-fetcher.js (skeleton)
- [x] Define data attribution format

### Phase 2: Amazon Scraper ⚠️
- [x] ~~Install Playwright~~ — dropped; nothing in the active code imports it
- [ ] Test amazon-scraper.js against amazon.in
- [ ] Handle rate limiting + timeouts
- [ ] Expand product list beyond current 6
- [ ] Integrate into collector.js

### Phase 3: Liquor MRP ⚠️
- [ ] Get official Delhi Excise Board data
- [ ] Format into liquor-mrp-fetcher.js
- [ ] Set up quarterly verification reminder
- [ ] Fallback to LivingLiquidz API if available

### Phase 4: Merge Sources ⚠️
- [ ] Update collector.js to call all three sources
- [ ] Merge results with source attribution
- [ ] Update data.js format with source links
- [ ] Display sources in web UI

### Phase 5: Transparency UI ⚠️
- [ ] Show "Last Updated" timestamps
- [ ] Display source for each price (link to verification)
- [ ] Add "How We Get Our Data" page
- [ ] Add disclaimer: "Prices current as of [date]"

---

## Questions Before Implementation

1. **Amazon scraping:** Does your ISP allow web scraping? (may need proxy)
2. **Liquor prices:** Do you have access to official Delhi Excise Board data?
3. **Update frequency:** How often should data refresh?
   - Duty Free: Daily ✓
   - Amazon: Daily or weekly?
   - Liquor MRP: Quarterly or on-demand?
4. **Fallback strategy:** What if a scraper fails?
   - Cache last successful price?
   - Show "Last updated X days ago" warning?

---

## Next Steps

1. ✅ Documents created (this file + scrapers)
2. → Need user decision: proceed with Phase 2 (Amazon scraper)?
3. → Get official data sources for liquor MRP
4. → Integrate scrapers into main collector

---

*Prepared by: GitHub Copilot*  
*Date: 2026-09-03*  
*Status: Ready for implementation decision*
