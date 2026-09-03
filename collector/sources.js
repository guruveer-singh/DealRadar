/*
  Data Sources Configuration
  
  Each market price must come from an OFFICIAL, VERIFIABLE source.
  This file documents where data is fetched from and how to validate it.
*/

const DATA_SOURCES = {
  perfumes: {
    primary: "Amazon.in",
    backup: "Nykaa.com",
    searchTerm: "product name + volume",
    example: "Dior Sauvage EDT 100ml site:amazon.in",
    validationSteps: [
      "Search Amazon.in for product",
      "Filter by Prime/Verified sellers only",
      "Note the MRP (printed on box) vs selling price",
      "Use MRP as official market price (not flash sale prices)"
    ]
  },
  
  chocolates: {
    primary: "Amazon.in",
    backup: "Blinkit.com (Swiggy Instamart)",
    searchTerm: "brand + product + weight",
    example: "Toblerone Milk 360g site:amazon.in",
    validationSteps: [
      "Check Amazon MRP label",
      "Verify with Blinkit for consistency",
      "Use standard pack size"
    ]
  },

  liquor: {
    primary: "State Excise Board MRP",
    backup: "LivingLiquidz.com (Delhi rates)",
    searchTerm: "brand + size",
    example: "Johnnie Walker Black Label 1L Delhi MRP",
    validationSteps: [
      "Check State Excise official rates (per state)",
      "Use Delhi MRP as baseline",
      "Liquor MRP is FIXED, not discount",
      "Source: https://www.deexcise.in/ or state liquor board"
    ]
  }
};

/*
  COLLECTOR STRATEGY V2:

  1. ✅ DUTY FREE: Already live from delhidutyfree.co.in API
  2. ❌→✅ AMAZON: Add playwright scraper for amazon.in
  3. ❌→✅ LIQUOR MRP: Add state excise board scraper + manual updates
  4. ✅ DOCUMENTATION: Link each price to its source

  Next Steps:
  - Add amazon-scraper.js (fetch current prices)
  - Add liquor-mrp-fetcher.js (state excise board or CSV)
  - Modify collector.js to merge all sources
  - Add "source" + "lastUpdated" to each product
*/

module.exports = DATA_SOURCES;
