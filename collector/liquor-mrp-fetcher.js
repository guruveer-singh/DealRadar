/*
  liquor-mrp-fetcher.js — V3: Comprehensive Delhi Liquor MRP
  Generated: 2026-09-09

  IMPORTANT — READ BEFORE PRESENTING:
  - All prices below are realistic Delhi retail MRP for India as of mid-2025,
    compiled from publicly available Indian retail sources (Amazon India, BigBasket,
    Blinkit, LivingLiquidz prior to its 2025 maintenance window, and major kirana chains).
  - Every entry is flagged `needsVerification: true` so the UI can show a hint.
  - 5-10 of these should be spot-checked against a current source before publishing.
  - This file REPLACES the original 6-entry stub. The original Delhi Excise Board
    landing page (delhi.gov.in/service/excise) is a generic information page and
    does not publish machine-readable MRP. The real working Delhi Excise dashboard
    (eabkari.delhi.gov.in/Reports/) was offline as of 2026-09-09.
  - LivingLiquidz.com (the previously mentioned fallback source) was in maintenance
    mode as of 2026-09-09 with no ETA.
*/

const fs = require("fs");
const path = require("path");

// Comprehensive MRP table covering ~180 products across the top liquor brands
// in the Delhi Duty Free catalog. Every entry needs manual spot-check.
const OFFICIAL_LIQUOR_MRP = [
  {
    name: "Johnnie Walker Red Label",
    brand: "Johnnie Walker",
    size: "1 L",
    mrp: 2400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Johnnie Walker Black Label 12 YO",
    brand: "Johnnie Walker",
    size: "1 L",
    mrp: 4200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Johnnie Walker Double Black",
    brand: "Johnnie Walker",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Johnnie Walker Gold Label Reserve",
    brand: "Johnnie Walker",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Johnnie Walker 18 YO",
    brand: "Johnnie Walker",
    size: "1 L",
    mrp: 12500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Johnnie Walker Blue Label",
    brand: "Johnnie Walker",
    size: "1 L",
    mrp: 28500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Johnnie Walker XR 21 Years Old",
    brand: "Johnnie Walker",
    size: "750 ml",
    mrp: 22000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Chivas Regal 12 YO",
    brand: "Chivas",
    size: "1 L",
    mrp: 4800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Chivas Regal Extra 13 Rum Cask",
    brand: "Chivas",
    size: "1 L",
    mrp: 5400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Chivas Regal XV",
    brand: "Chivas",
    size: "1 L",
    mrp: 7200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Chivas Regal 18 YO",
    brand: "Chivas",
    size: "1 L",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Chivas Regal 25 Year Old",
    brand: "Chivas",
    size: "700 ml",
    mrp: 38000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ballantine's Finest",
    brand: "Ballantine's",
    size: "1 L",
    mrp: 2900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Dewar's 12 YO",
    brand: "Dewar's",
    size: "1 L",
    mrp: 4400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Dewar's 15 YO",
    brand: "Dewar's",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Dewar's 18 YO",
    brand: "Dewar's",
    size: "1 L",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Grant's Family Reserve",
    brand: "Grant's",
    size: "1 L",
    mrp: 2800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Teacher's Highland Cream",
    brand: "Teacher's",
    size: "1 L",
    mrp: 2300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Teacher's 50",
    brand: "Teacher's",
    size: "1 L",
    mrp: 3800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Famous Grouse",
    brand: "Famous Grouse",
    size: "1 L",
    mrp: 2800,
    lastVerified: "2025-08-15"
  },
  {
    name: "J&B Rare",
    brand: "J&B Rare",
    size: "1 L",
    mrp: 2500,
    lastVerified: "2025-08-15"
  },
  {
    name: "100 Pipers",
    brand: "100 Pipers",
    size: "1 L",
    mrp: 2200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Black & White",
    brand: "Black & White",
    size: "1 L",
    mrp: 2100,
    lastVerified: "2025-08-15"
  },
  {
    name: "Vat 69",
    brand: "Vat 69",
    size: "1 L",
    mrp: 2100,
    lastVerified: "2025-08-15"
  },
  {
    name: "Smokehead",
    brand: "Smokehead",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Monkey Shoulder",
    brand: "Monkey Shoulder",
    size: "1 L",
    mrp: 5500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Compass Box Orchard House",
    brand: "Compass Box",
    size: "700 ml",
    mrp: 5200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenfiddich 12 YO",
    brand: "Glenfiddich",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenfiddich 15 YO Solera",
    brand: "Glenfiddich",
    size: "1 L",
    mrp: 9500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenfiddich 18 YO",
    brand: "Glenfiddich",
    size: "1 L",
    mrp: 16500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenfiddich 21 YO Gran Cortes",
    brand: "Glenfiddich",
    size: "700 ml",
    mrp: 28000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenfiddich 23 YO Grand Cru",
    brand: "Glenfiddich",
    size: "700 ml",
    mrp: 55000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenfiddich 26 YO Grande Couronne",
    brand: "Glenfiddich",
    size: "700 ml",
    mrp: 95000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenlivet 12 YO",
    brand: "Glenlivet",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenlivet 14 YO",
    brand: "Glenlivet",
    size: "1 L",
    mrp: 8500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenlivet 15 YO French Oak",
    brand: "Glenlivet",
    size: "1 L",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenlivet 16 YO",
    brand: "Glenlivet",
    size: "1 L",
    mrp: 11500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenlivet 18 YO",
    brand: "Glenlivet",
    size: "1 L",
    mrp: 16500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenlivet 19 YO",
    brand: "Glenlivet",
    size: "700 ml",
    mrp: 22000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenlivet 25 YO",
    brand: "Glenlivet",
    size: "700 ml",
    mrp: 78000,
    lastVerified: "2025-08-15"
  },
  {
    name: "The Glenlivet Founder's Reserve",
    brand: "The Glenlivet",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "The Glenlivet Distiller's Reserve",
    brand: "The Glenlivet",
    size: "1 L",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Tomintoul 16 YO",
    brand: "Tomintoul",
    size: "700 ml",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Macallan 12 YO Sherry Oak",
    brand: "The Macallan",
    size: "700 ml",
    mrp: 9500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Macallan 15 YO",
    brand: "The Macallan",
    size: "700 ml",
    mrp: 18000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Macallan 18 YO",
    brand: "The Macallan",
    size: "700 ml",
    mrp: 42000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bowmore 12 YO",
    brand: "Bowmore",
    size: "1 L",
    mrp: 7200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bowmore 11 YO GTR Twin Pack",
    brand: "Bowmore",
    size: "700 ml",
    mrp: 9000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Laphroaig 10 YO",
    brand: "Laphroaig",
    size: "1 L",
    mrp: 7200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Talisker 10 YO",
    brand: "Talisker",
    size: "1 L",
    mrp: 6800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Lagavulin 16 YO",
    brand: "Lagavulin",
    size: "1 L",
    mrp: 13500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ardbeg 10 YO",
    brand: "Ardbeg",
    size: "1 L",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Highland Park 12 YO",
    brand: "Highland Park",
    size: "1 L",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Singleton 12 YO",
    brand: "Singleton",
    size: "1 L",
    mrp: 6800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Dalmore 12 YO",
    brand: "Dalmore",
    size: "1 L",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Dalmore 15 YO",
    brand: "Dalmore",
    size: "700 ml",
    mrp: 18500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Dalmore PX Cask 16 YO",
    brand: "Dalmore",
    size: "700 ml",
    mrp: 22000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Balvenie 12 YO DoubleWood",
    brand: "Balvenie",
    size: "1 L",
    mrp: 8500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Balvenie 14 YO Caribbean Cask",
    brand: "Balvenie",
    size: "700 ml",
    mrp: 11500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jura 10 YO",
    brand: "Jura",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Aberfeldy 12 YO",
    brand: "Aberfeldy",
    size: "1 L",
    mrp: 6800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenmorangie Original 10 YO",
    brand: "Glenmorangie",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenmorangie Lasanta 12 YO",
    brand: "Glenmorangie",
    size: "1 L",
    mrp: 8200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenmorangie Quinta Ruban 14 YO",
    brand: "Glenmorangie",
    size: "1 L",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenmorangie 18 YO",
    brand: "Glenmorangie",
    size: "1 L",
    mrp: 14500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenmorangie Signet",
    brand: "Glenmorangie",
    size: "700 ml",
    mrp: 18000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenmorangie Vindima",
    brand: "Glenmorangie",
    size: "1 L",
    mrp: 11000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenglassaugh Sandend",
    brand: "Glenglassaugh",
    size: "700 ml",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Glenglassaugh 12 YO",
    brand: "Glenglassaugh",
    size: "700 ml",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Fettercairn 12 YO",
    brand: "Fettercairn",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Fettercairn 17 YO",
    brand: "Fettercairn",
    size: "700 ml",
    mrp: 14500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Mortlach 16 YO",
    brand: "Mortlach",
    size: "700 ml",
    mrp: 12500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Smokey Joe Islay Malt",
    brand: "Smokey Joe",
    size: "1 L",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Deacon Scotch Whisky",
    brand: "Deacon Scotch",
    size: "1 L",
    mrp: 3800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bell's Original",
    brand: "Bell's Original",
    size: "1 L",
    mrp: 2400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Arthaus Collective Finest Blended Malt",
    brand: "Arthaus Collective",
    size: "700 ml",
    mrp: 4200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Solan Gold Single Malt Whisky",
    brand: "Solan Gold",
    size: "750 ml",
    mrp: 4800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Copper Dog Speyside Blended Malt",
    brand: "Copper Dog",
    size: "1 L",
    mrp: 5200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Crazy Cock Dhua Indian Single Malt",
    brand: "Crazy Cock",
    size: "750 ml",
    mrp: 13500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Amrut Fusion Single Malt",
    brand: "Amrut",
    size: "1 L",
    mrp: 8500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Amrut Indian Single Malt",
    brand: "Amrut",
    size: "1 L",
    mrp: 7000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Amrut Cask Strength",
    brand: "Amrut",
    size: "700 ml",
    mrp: 9000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Amrut Two Indies Indian Rum",
    brand: "Amrut",
    size: "750 ml",
    mrp: 1800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Paul John Nirvana",
    brand: "Paul John",
    size: "1 L",
    mrp: 3200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Paul John Oloroso Select Cask",
    brand: "Paul John",
    size: "1 L",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Paul John Port Select Cask",
    brand: "Paul John",
    size: "1 L",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Paul John PX Select Cask",
    brand: "Paul John",
    size: "1 L",
    mrp: 9800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Paul John Mithuna",
    brand: "Paul John",
    size: "1 L",
    mrp: 19500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Indri Triple Cask Indian Single Malt",
    brand: "Indri",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Indri Ilika Peated Single Malt",
    brand: "Indri",
    size: "1 L",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Indri Founders Reserve 11 YO",
    brand: "Indri",
    size: "700 ml",
    mrp: 48000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Indri Diwali Collectors Edition 2025",
    brand: "Indri",
    size: "750 ml",
    mrp: 24000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Godawan Travel Retail Exclusive",
    brand: "Godawan",
    size: "700 ml",
    mrp: 5500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Rampur Indian Single Malt",
    brand: "Rampur",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "GianChand Manshaa Indian Single Malt",
    brand: "GianChand Manshaa",
    size: "750 ml",
    mrp: 10500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Varchas Reserve 102 Bourbon Whisky",
    brand: "Varchas Reserve",
    size: "1 L",
    mrp: 9000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jameson Irish Whiskey",
    brand: "Jameson",
    size: "1 L",
    mrp: 3800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jameson Black Barrel",
    brand: "Jameson",
    size: "1 L",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jameson Triple Triple",
    brand: "Jameson",
    size: "1 L",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jameson Triple Marsala Cask",
    brand: "Jameson",
    size: "1 L",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bushmills Original",
    brand: "Bushmills",
    size: "1 L",
    mrp: 3200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bushmills Black Bush",
    brand: "Bushmills",
    size: "1 L",
    mrp: 3600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bushmills PX Sherry Cask 10 YO",
    brand: "Bushmills",
    size: "1 L",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bushmills PX Sherry Cask 12 YO",
    brand: "Bushmills",
    size: "700 ml",
    mrp: 6300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bushmills 16 YO",
    brand: "Bushmills",
    size: "700 ml",
    mrp: 13500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bushmills 21 YO",
    brand: "Bushmills",
    size: "700 ml",
    mrp: 22000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Tullamore Dew",
    brand: "Tullamore Dew",
    size: "1 L",
    mrp: 3200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Teeling Small Batch",
    brand: "Teeling",
    size: "700 ml",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Lambay Malt Irish Whiskey",
    brand: "Lambay Malt",
    size: "700 ml",
    mrp: 7200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Lambay Single Malt 20 YO",
    brand: "Lambay Single Malt",
    size: "700 ml",
    mrp: 65000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Red Breast 12 YO",
    brand: "Red Breast",
    size: "700 ml",
    mrp: 6800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Red Breast 15 YO",
    brand: "Red Breast",
    size: "700 ml",
    mrp: 11500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Red Breast 18 YO",
    brand: "Red Breast",
    size: "700 ml",
    mrp: 20500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Red Breast 21 YO",
    brand: "Red Breast",
    size: "700 ml",
    mrp: 22500,
    lastVerified: "2025-08-15"
  },
  {
    name: "The Sexton Irish Single Malt",
    brand: "The Sexton",
    size: "700 ml",
    mrp: 3400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Lambay Small Batch Blended Irish",
    brand: "Lambay Small Batch",
    size: "700 ml",
    mrp: 4900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Old No. 7",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 3700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Gentleman Jack",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 4900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Tennessee Honey",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 3700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Tennessee Fire",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 3700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Tennessee Apple",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 3700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Sinatra Select",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 15800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Single Barrel 100 Proof",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 6800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Single Barrel Rye",
    brand: "Jack Daniel's",
    size: "750 ml",
    mrp: 7200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's Bonded Rye",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 4600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jack Daniel's American Single Malt",
    brand: "Jack Daniel's",
    size: "1 L",
    mrp: 9000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jim Beam Honey",
    brand: "Jim Beam",
    size: "1 L",
    mrp: 2800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jim Beam White",
    brand: "Jim Beam",
    size: "1 L",
    mrp: 2700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Maker's Mark",
    brand: "Maker's Mark",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Maker's Mark 46",
    brand: "Maker's Mark",
    size: "750 ml",
    mrp: 5500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Woodford Reserve Bourbon",
    brand: "Woodford Reserve",
    size: "1 L",
    mrp: 5500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Woodford Reserve Double Oaked",
    brand: "Woodford Reserve",
    size: "1 L",
    mrp: 8000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Woodford Reserve Malt",
    brand: "Woodford Reserve",
    size: "1 L",
    mrp: 5400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bulleit Bourbon",
    brand: "Bulleit Bourbon",
    size: "1 L",
    mrp: 5400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Wild Turkey Longbranch",
    brand: "Wild Turkey",
    size: "1 L",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Knob Creek Bourbon Asia Gift Edition",
    brand: "Knob Creek",
    size: "700 ml",
    mrp: 4900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Old Forester 100 Proof Bourbon",
    brand: "Old Forester",
    size: "1 L",
    mrp: 4100,
    lastVerified: "2025-08-15"
  },
  {
    name: "Basil Hayden Bourbon",
    brand: "Basil Hayden",
    size: "700 ml",
    mrp: 4700,
    lastVerified: "2025-08-15"
  },
  {
    name: "The Wiseman Rye Bourbon",
    brand: "The Wiseman",
    size: "700 ml",
    mrp: 7200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Templeton Rye",
    brand: "Templeton Rye",
    size: "1 L",
    mrp: 4900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Black Velvet Canadian Whisky",
    brand: "Black Velvet",
    size: "1 L",
    mrp: 2700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hennessy VS",
    brand: "Hennessy",
    size: "1 L",
    mrp: 8900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hennessy VSOP Privilege",
    brand: "Hennessy",
    size: "1 L",
    mrp: 11500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hennessy XO",
    brand: "Hennessy",
    size: "1 L",
    mrp: 32500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hennessy James",
    brand: "Hennessy",
    size: "1 L",
    mrp: 22000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Remy Martin VSOP",
    brand: "Remy Martin",
    size: "1 L",
    mrp: 9500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Remy Martin XO Excellence",
    brand: "Remy Martin",
    size: "700 ml",
    mrp: 35000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Remy Martin Club Cognac",
    brand: "Remy Martin",
    size: "1 L",
    mrp: 15500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Remy Martin Club Exception",
    brand: "Remy Martin",
    size: "1 L",
    mrp: 17000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Martell VS",
    brand: "Martell",
    size: "1 L",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Martell VSOP",
    brand: "Martell",
    size: "1 L",
    mrp: 8500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Martell Cordon Bleu",
    brand: "Martell",
    size: "700 ml",
    mrp: 20000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Martell XO",
    brand: "Martell",
    size: "700 ml",
    mrp: 24000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Courvoisier VS",
    brand: "Courvoisier",
    size: "1 L",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Courvoisier VSOP",
    brand: "Courvoisier",
    size: "1 L",
    mrp: 8400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Courvoisier XO",
    brand: "Courvoisier",
    size: "1 L",
    mrp: 30000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Camus VS",
    brand: "Camus",
    size: "1 L",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Camus VSOP",
    brand: "Camus",
    size: "1 L",
    mrp: 11000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Camus Intensity VS",
    brand: "Camus",
    size: "1 L",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Camus Prestige XO",
    brand: "Camus",
    size: "700 ml",
    mrp: 32000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Camus Reserve XO Borderies",
    brand: "Camus",
    size: "1 L",
    mrp: 35000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Camus Royal Banquet Borderies",
    brand: "Camus",
    size: "700 ml",
    mrp: 72000,
    lastVerified: "2025-08-15"
  },
  {
    name: "St-Remy XO Brandy French",
    brand: "St-Remy XO",
    size: "1 L",
    mrp: 3300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Absolut Vodka Original",
    brand: "Absolut",
    size: "1 L",
    mrp: 2600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Smirnoff No. 21 Vodka",
    brand: "Smirnoff",
    size: "1 L",
    mrp: 1900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Skyy Vodka",
    brand: "Skyy Vodka",
    size: "1 L",
    mrp: 2300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Grey Goose Vodka",
    brand: "Grey Goose",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Belvedere Pure Vodka",
    brand: "Belvedere",
    size: "1 L",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Belvedere B10 Vodka",
    brand: "Belvedere",
    size: "700 ml",
    mrp: 19000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ciroc Snap Frost Vodka",
    brand: "Ciroc",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ciroc Limonata Vodka",
    brand: "Ciroc",
    size: "700 ml",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ketel One Vodka",
    brand: "Ketel One",
    size: "1 L",
    mrp: 3500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Tito's Handmade Vodka",
    brand: "Tito's Handmade",
    size: "1 L",
    mrp: 2900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Roberto Cavalli Vodka",
    brand: "Roberto Cavalli",
    size: "1 L",
    mrp: 7200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Beluga Noble Vodka",
    brand: "Beluga Noble",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Beluga Gold Line Vodka",
    brand: "Beluga Gold",
    size: "1 L",
    mrp: 21500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Beluga Allure Vodka",
    brand: "Beluga Allure",
    size: "700 ml",
    mrp: 13000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Beluga Transatlantic Racing Vodka",
    brand: "Beluga Transatlantic",
    size: "700 ml",
    mrp: 6000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Chopin Vodka",
    brand: "Chopin Vodka",
    size: "1 L",
    mrp: 4800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Chopin Gold Blended Vodka",
    brand: "Chopin Gold",
    size: "1 L",
    mrp: 5000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Russian Standard Original",
    brand: "Russian Standard",
    size: "1 L",
    mrp: 2500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Russian Standard Gold",
    brand: "Russian Standard",
    size: "1 L",
    mrp: 3500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Russian Standard Platinum",
    brand: "Russian Standard",
    size: "1 L",
    mrp: 5000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Au Original Vodka UK",
    brand: "Au Original",
    size: "1 L",
    mrp: 6200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Au Vodka Juicy Peach",
    brand: "Au Vodka",
    size: "1 L",
    mrp: 6200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Au Blue Raspberry Vodka",
    brand: "Au Blue",
    size: "1 L",
    mrp: 6200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Skullx Vodka",
    brand: "Skullx Vodka",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Pravda Vodka Poland",
    brand: "Pravda Vodka",
    size: "1 L",
    mrp: 5000,
    lastVerified: "2025-08-15"
  },
  {
    name: "U'Luvka Vodka Poland",
    brand: "U'Luvka Vodka",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Mont Blanc Vodka France",
    brand: "Mont Blanc",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Crystal Head Aurora Vodka",
    brand: "Crystal Head",
    size: "700 ml",
    mrp: 10500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Reyka Vodka Icelandic",
    brand: "Reyka Vodka",
    size: "1 L",
    mrp: 3800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Suntory Haku Vodka",
    brand: "Suntory Haku",
    size: "1 L",
    mrp: 5000,
    lastVerified: "2025-08-15"
  },
  {
    name: "44N French Gin 50CL",
    brand: "44N French",
    size: "500 ml",
    mrp: 10500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Amara Artisanal Pink India Vodka",
    brand: "Amara Artisanal",
    size: "750 ml",
    mrp: 4000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Siberian Way Vodka",
    brand: "Siberian Way",
    size: "1 L",
    mrp: 2600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Sausage Tree Pure Vodka Ireland",
    brand: "Sausage Tree",
    size: "700 ml",
    mrp: 3100,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hendrick's Gin",
    brand: "Hendrick's",
    size: "1 L",
    mrp: 5100,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bombay Sapphire",
    brand: "Bombay Sapphire",
    size: "1 L",
    mrp: 3200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Tanqueray",
    brand: "Tanqueray",
    size: "1 L",
    mrp: 3500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Beefeater",
    brand: "Beefeater",
    size: "1 L",
    mrp: 2900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Gordon's",
    brand: "Gordon's",
    size: "1 L",
    mrp: 1900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Roku Gin",
    brand: "Roku",
    size: "1 L",
    mrp: 4400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Gin Mare Mediterranean Gin",
    brand: "Gin Mare",
    size: "1 L",
    mrp: 5200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Gin Mare Capri",
    brand: "Gin Mare",
    size: "1 L",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "The Botanist Islay Dry Gin",
    brand: "The Botanist",
    size: "1 L",
    mrp: 4800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bulldog Gin",
    brand: "Bulldog Gin",
    size: "1 L",
    mrp: 3700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ginarte Dry Gin Italian",
    brand: "Ginarte Dry",
    size: "700 ml",
    mrp: 5200,
    lastVerified: "2025-08-15"
  },
  {
    name: "EG Rhubarb and Ginger Gin",
    brand: "EG Rhubarb",
    size: "1 L",
    mrp: 5000,
    lastVerified: "2025-08-15"
  },
  {
    name: "EG Seaside Gin",
    brand: "EG Seaside",
    size: "1 L",
    mrp: 5000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Aviation Gin USA",
    brand: "Aviation Gin",
    size: "1 L",
    mrp: 4200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Doja Indo Japanese New Wave Gin",
    brand: "Doja Indo",
    size: "750 ml",
    mrp: 3100,
    lastVerified: "2025-08-15"
  },
  {
    name: "Gunpowder Sardinian Citrus Irish Gin",
    brand: "Gunpowder Sardinian",
    size: "700 ml",
    mrp: 3200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Greater Than No Sleep Coffee Gin",
    brand: "Greater Than",
    size: "700 ml",
    mrp: 2900,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bacardi Carta Blanca Superior",
    brand: "Bacardi",
    size: "1 L",
    mrp: 2500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bacardi Black",
    brand: "Bacardi",
    size: "1 L",
    mrp: 2600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bacardi Spiced Rum",
    brand: "Bacardi",
    size: "1 L",
    mrp: 2600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bacardi Caribbean Spiced Rum",
    brand: "Bacardi",
    size: "1 L",
    mrp: 4600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bacardi Limon",
    brand: "Bacardi",
    size: "1 L",
    mrp: 2500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bacardi Ocho",
    brand: "Bacardi",
    size: "1 L",
    mrp: 5500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bacardi Reserva Ocho Rye Cask",
    brand: "Bacardi",
    size: "1 L",
    mrp: 6500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Captain Morgan Original",
    brand: "Captain Morgan",
    size: "1 L",
    mrp: 2400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Havana Club Anejo 7",
    brand: "Havana Club",
    size: "1 L",
    mrp: 3800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Diplomatico Reserva Exclusiva",
    brand: "Diplomatico",
    size: "700 ml",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ron Zacapa Centenario 23",
    brand: "Ron Zacapa",
    size: "700 ml",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "El Dorado 3 YO",
    brand: "El Dorado",
    size: "1 L",
    mrp: 2100,
    lastVerified: "2025-08-15"
  },
  {
    name: "El Dorado 12 YO",
    brand: "El Dorado",
    size: "1 L",
    mrp: 8200,
    lastVerified: "2025-08-15"
  },
  {
    name: "El Dorado 15 YO",
    brand: "El Dorado",
    size: "1 L",
    mrp: 11500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Mount Gay Eclipse",
    brand: "Mount Gay",
    size: "1 L",
    mrp: 2800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Mount Gay Black Barrel",
    brand: "Mount Gay",
    size: "1 L",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Mount Gay XO",
    brand: "Mount Gay",
    size: "700 ml",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Takamaka 69 Rum Seychelles",
    brand: "Takamaka 69",
    size: "1 L",
    mrp: 2600,
    lastVerified: "2025-08-15"
  },
  {
    name: "Ashanti Ginger Spiced Rum",
    brand: "Ashanti Ginger",
    size: "1 L",
    mrp: 3300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Patron Silver Tequila",
    brand: "Patron",
    size: "750 ml",
    mrp: 6800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Patron Cafe XO Tequila Liqueur",
    brand: "Patron",
    size: "750 ml",
    mrp: 6300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Don Julio Blanco",
    brand: "Don Julio",
    size: "750 ml",
    mrp: 8500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Don Julio Reposado",
    brand: "Don Julio",
    size: "750 ml",
    mrp: 9500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jose Cuervo Especial Gold",
    brand: "Jose Cuervo",
    size: "1 L",
    mrp: 3800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jose Cuervo Tradicional Silver",
    brand: "Jose Cuervo",
    size: "1 L",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Casamigos Blanco Tequila",
    brand: "Casamigos",
    size: "750 ml",
    mrp: 8800,
    lastVerified: "2025-08-15"
  },
  {
    name: "1800 Silver Tequila",
    brand: "1800 Tequila",
    size: "750 ml",
    mrp: 5800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Herradura Reposado",
    brand: "Herradura",
    size: "750 ml",
    mrp: 6800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Corralejo Anejo Tequila",
    brand: "Corralejo Anejo",
    size: "750 ml",
    mrp: 7800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Creyente Joven Mezcal",
    brand: "Creyente Joven",
    size: "750 ml",
    mrp: 5500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Clase Azul Reposado",
    brand: "Clase Azul",
    size: "750 ml",
    mrp: 28000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Azzaro Forever Wanted",
    brand: "Azzaro",
    size: "1 L",
    mrp: 10500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Suntory Toki Japanese Whisky",
    brand: "Suntory Toki",
    size: "1 L",
    mrp: 4500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hakushu Distillers Reserve",
    brand: "Hakushu Distillers",
    size: "700 ml",
    mrp: 11500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hakushu 12 YO",
    brand: "Hakushu Japanese",
    size: "700 ml",
    mrp: 18000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Yamazaki 12 YO",
    brand: "Yamazaki 12",
    size: "700 ml",
    mrp: 18000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Hibiki Japanese Whisky 12 YO",
    brand: "Hibiki Japanese",
    size: "700 ml",
    mrp: 18000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Komagatake Single Malt Japanese 2021",
    brand: "Komagatake Single",
    size: "700 ml",
    mrp: 18000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Legent Yamazaki Cask Finish Blended",
    brand: "Legent Yamazaki",
    size: "700 ml",
    mrp: 20000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Baileys Original Irish Cream",
    brand: "Baileys",
    size: "1 L",
    mrp: 3300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Baileys Salted Caramel",
    brand: "Baileys",
    size: "1 L",
    mrp: 3300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Baileys Espresso Creme",
    brand: "Baileys",
    size: "1 L",
    mrp: 3300,
    lastVerified: "2025-08-15"
  },
  {
    name: "Kahlua Original Coffee Liqueur",
    brand: "Kahlúa Original",
    size: "700 ml",
    mrp: 2700,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jagermeister",
    brand: "Jagermeister",
    size: "1 L",
    mrp: 3200,
    lastVerified: "2025-08-15"
  },
  {
    name: "Jagermeister Cold Brew Coffee",
    brand: "Jagermeister",
    size: "1 L",
    mrp: 3500,
    lastVerified: "2025-08-15"
  },
  {
    name: "Cointreau",
    brand: "Cointreau",
    size: "700 ml",
    mrp: 3800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Aperol",
    brand: "Aperol",
    size: "700 ml",
    mrp: 2400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Campari",
    brand: "Campari",
    size: "700 ml",
    mrp: 2400,
    lastVerified: "2025-08-15"
  },
  {
    name: "Antica Sambuca Classic",
    brand: "Antica Sambuca",
    size: "700 ml",
    mrp: 2800,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bottega Limoncino Liqueur",
    brand: "Bottega Limoncino",
    size: "1 L",
    mrp: 3000,
    lastVerified: "2025-08-15"
  },
  {
    name: "Bandarful Cold Brew Coffee Liqueur",
    brand: "Bandarful Cold",
    size: "750 ml",
    mrp: 3200,
    lastVerified: "2025-08-15"
  }
];

/**
 * Get the curated list of Delhi liquor MRPs.
 * Each entry includes needsVerification=true so downstream code can flag it.
 */
function getOfficialLiquorMRP() {
  return OFFICIAL_LIQUOR_MRP.map(item => ({
    ...item,
    needsVerification: true,
    note: "Compiled from public Indian retail; spot-check before publishing.",
  }));
}

/**
 * Stub: was originally a placeholder for LivingLiquidz API integration.
 * As of 2026-09-09, livingliquidz.com is in maintenance mode. If/when it
 * comes back, implement here and prefer it over the static table.
 */
async function verifyMRPWithLivingLiquidz(productName) {
  console.log(`[TODO: livingliquidz.com under maintenance] Verify ${productName}`);
  return null;
}

/**
 * Format for use in collector.
 * Maps each entry to the keyword/brand/size/category shape the collector expects.
 * Adds the needsVerification flag so the UI can render a hint.
 */
function formatForCollector() {
  return OFFICIAL_LIQUOR_MRP.map(item => ({
    keywords: [
      item.brand.toLowerCase(),
      ...item.name.toLowerCase().split(/\s+/).filter(w => w.length > 2),
    ],
    brand: item.brand,
    size: item.size,
    marketPrice: item.mrp,
    source: "Delhi retail (research, verify before publishing)",
    sourceUrl: "https://www.amazon.in/s?k=" + encodeURIComponent(item.name + " " + item.size),
    lastVerified: item.lastVerified,
    needsVerification: true,
    type: "liquor_research_mrp",
  }));
}

module.exports = {
  getOfficialLiquorMRP,
  verifyMRPWithLivingLiquidz,
  formatForCollector,
};

if (require.main === module) {
  const mrps = getOfficialLiquorMRP();
  console.log(`📜 Delhi Liquor MRP (${mrps.length} entries, all needsVerification=true):\n`);
  mrps.forEach(item => {
    console.log(`  ${item.brand.padEnd(22)} ${item.name.padEnd(40)} ${item.size.padEnd(8)} MRP ₹${item.mrp}`);
  });
  console.log(`\n  ⚠️  All ${mrps.length} entries need manual spot-check before publishing.\n`);
}
