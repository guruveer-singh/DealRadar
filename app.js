/*
  app.js — all the logic for DealRadar.

  What it does:
    1. Takes each product and calculates savings + a "Deal Score".
    2. Draws a card for every product (with a 🔥 ribbon on the best ones).
    3. Lets the user search, filter by category, and sort.
    4. Shows when prices were last updated.

  It reads PRODUCTS / LAST_UPDATED from data.js (loaded before this file).
  data.js is rewritten automatically by the collector script (V2).
*/

// ---- 1. Money helper: format 8500 -> "₹8,500" (Indian style) ----
function rupees(n) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

// ---- 2. "2 hours ago" style time formatting ----
function timeAgo(isoString) {
  const then = new Date(isoString).getTime();
  if (isNaN(then)) return "unknown";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " min ago";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + (hrs === 1 ? " hour ago" : " hours ago");
  const days = Math.round(hrs / 24);
  return days + (days === 1 ? " day ago" : " days ago");
}

// ---- 3. Add calculated fields to every product ----
function withStats(p) {
  const hasMarket = Number(p.market) > 0;
  const savings = hasMarket ? p.market - p.dutyFree : 0;
  const savingsPct = hasMarket ? (savings / p.market) * 100 : 0;
  const dealScore = hasMarket
    ? Math.min(100, Math.max(0, Math.round(savingsPct * 2.5)))
    : (p.isExclusive ? 95 : 60);

  const priceChange = p.previousDutyFree ? p.dutyFree - p.previousDutyFree : 0;

  return { ...p, savings, savingsPct, dealScore, priceChange, hasMarket };
}

let ALL = [];

const HOT_SCORE = 85;

// ---- 4. Give each score a colour + label ----
function scoreTier(score) {
  if (score >= 80) return { label: "Great deal", cls: "great" };
  if (score >= 60) return { label: "Good deal",  cls: "good" };
  return { label: "Standard", cls: "okay" };
}

// ---- 5. Current state of the filters ----
let activeCategory = "All";
let searchText = "";
let sortMode = "score"; // "score" | "savings" | "price"

// ---- 6. Build one product card as HTML ----
function cardHTML(p) {
  const tier = scoreTier(p.dealScore);
  const isExclusive = Boolean(p.isExclusive);
  const hot = p.hasMarket && p.dealScore >= HOT_SCORE;
  const safeSavingsPct = Math.max(0, p.savingsPct);

  let savingsLabel = "";
  if (isExclusive) {
    savingsLabel = `Airport Exclusive · Save ${rupees(p.savings)}`;
  } else if (p.hasMarket) {
    savingsLabel = p.savings >= 0
      ? `Save ${rupees(p.savings)} (${Math.round(p.savingsPct)}%)`
      : `${rupees(-p.savings)} more than market`;
  } else {
    savingsLabel = `Delhi Duty Free Live Price`;
  }

  const sourceLink = p.marketSourceUrl
    ? `<a href="${p.marketSourceUrl}" target="_blank" rel="noreferrer">View source</a>`
    : p.hasMarket ? "Reference price" : "Live Store Listing";

  const productLink = p.url
    ? `<a class="card__link" href="${p.url}" target="_blank" rel="noreferrer">Check at Delhi Duty Free <span aria-hidden="true">↗</span></a>`
    : "";

  let ribbonHTML = "";
  if (isExclusive) {
    ribbonHTML = `<div class="ribbon ribbon--exclusive">✈️ EXCLUSIVE</div>`;
  } else if (hot) {
    ribbonHTML = `<div class="ribbon">🔥 TOP DEAL</div>`;
  }

  let changeHTML = "";
  if (p.priceChange < 0) {
    changeHTML = `<span class="change change--down">▼ ${rupees(-p.priceChange)} cheaper than last check</span>`;
  } else if (p.priceChange > 0) {
    changeHTML = `<span class="change change--up">▲ ${rupees(p.priceChange)} costlier than last check</span>`;
  }

  const marketPriceHTML = p.hasMarket
    ? `<div class="price price--mkt">
         <span class="price__label">Market reference</span>
         <span class="price__value strike">${rupees(p.market)}</span>
       </div>`
    : `<div class="price price--mkt">
         <span class="price__label">Catalogue</span>
         <span class="price__value">Live Airport</span>
       </div>`;

  const barHTML = p.hasMarket
    ? `<div class="bar" title="${Math.round(p.savingsPct)}% cheaper than market">
         <div class="bar__fill bar__fill--${tier.cls}" style="width:${Math.min(100, safeSavingsPct * 2.5)}%"></div>
       </div>`
    : `<div class="bar" title="Duty Free Official Listing">
         <div class="bar__fill" style="width:100%; background:#d5eee2;"></div>
       </div>`;

  return `
    <article class="card ${isExclusive ? "card--hot" : hot ? "card--hot" : ""}">
      ${ribbonHTML}
      <div class="card__top">
        <span class="card__emoji">${p.emoji}</span>
        <span class="badge badge--${tier.cls}" title="Deal Score">${p.hasMarket ? p.dealScore : "Live"}</span>
      </div>
      <h3 class="card__name">${p.name}</h3>
      <p class="card__meta">${p.brand ? p.brand + ' · ' : ''}${p.size || '1 unit'}</p>

      <div class="prices">
        <div class="price price--df">
          <span class="price__label">Duty Free</span>
          <span class="price__value">${rupees(p.dutyFree)}</span>
        </div>
        ${marketPriceHTML}
      </div>

      ${barHTML}

      <div class="card__foot">
        <span class="save ${p.hasMarket && p.savings < 0 ? "save--negative" : ""}">${savingsLabel}</span>
        <span class="tier tier--${tier.cls}">${p.hasMarket ? tier.label : "Available"}</span>
      </div>
      <div class="card__source">
        <span>${p.marketSource || "Delhi Duty Free Live Catalog"}</span>
        ${sourceLink}
      </div>
      ${changeHTML}
      ${productLink}
    </article>
  `;
}

// ---- 7. Apply search + category + sort, then draw ----
function render() {
  let list = ALL.slice();

  // filter by category
  if (activeCategory !== "All") {
    list = list.filter(p => p.category === activeCategory);
  }

  // filter by search (matches name or brand)
  if (searchText.trim() !== "") {
    const q = searchText.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  // sort
  if (sortMode === "score")   list.sort((a, b) => b.dealScore - a.dealScore);
  if (sortMode === "savings") list.sort((a, b) => b.savings - a.savings);
  if (sortMode === "price")   list.sort((a, b) => a.dutyFree - b.dutyFree);

  // draw the cards
  const grid = document.getElementById("grid");
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <p>😕 Nothing matches "${searchText}".</p>
        <button class="chip" onclick="clearSearch()">Clear search</button>
      </div>`;
  } else {
    grid.innerHTML = list.map(cardHTML).join("");
  }

  // update headline stats
  const totalSave = list.reduce((sum, p) => sum + (p.hasMarket ? Math.max(0, p.savings) : 0), 0);
  const best = list.length ? list.reduce((a, b) => (b.dealScore > a.dealScore ? b : a)) : null;
  document.getElementById("count").textContent = list.length;
  document.getElementById("totalSave").textContent = rupees(totalSave);
  document.getElementById("bestDeal").textContent = best ? best.name : "—";
}

function clearSearch() {
  searchText = "";
  document.getElementById("search").value = "";
  render();
}

// ---- 8. Build category buttons (with product counts) ----
function buildCategoryButtons() {
  const cats = ["All", ...new Set(ALL.map(p => p.category))];
  const wrap = document.getElementById("categories");
  wrap.innerHTML = cats.map(c => {
    const count = c === "All" ? ALL.length : ALL.filter(p => p.category === c).length;
    return `<button class="chip ${c === activeCategory ? "chip--on" : ""}" data-cat="${c}">
              ${c} <span class="chip__count">${count}</span>
            </button>`;
  }).join("");

  wrap.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      buildCategoryButtons();
      render();
    });
  });
}

// ---- 9. Show data freshness in the header ----
function showFreshness() {
  const el = document.getElementById("updated");
  const live = typeof DATA_SOURCE !== "undefined" && DATA_SOURCE === "live";
  el.innerHTML = live
    ? `🟢 Live prices · updated ${timeAgo(LAST_UPDATED)}`
    : `🟡 Sample data · not live yet`;
}

// ---- 10. Wire up search box + sort dropdown ----
document.getElementById("search").addEventListener("input", (e) => {
  searchText = e.target.value;
  render();
});

document.getElementById("sort").addEventListener("change", (e) => {
  sortMode = e.target.value;
  render();
});

// ---- 11. Go! ----
function initDealRadar() {
  ALL = Array.isArray(PRODUCTS) ? PRODUCTS.map(withStats) : [];
  buildCategoryButtons();
  showFreshness();
  render();
}

// Wait for data.js to load
if (typeof PRODUCTS !== "undefined") {
  initDealRadar();
} else {
  // Fallback if data.js loads after app.js
  window.addEventListener("load", initDealRadar);
}

document.getElementById("year").textContent = new Date().getFullYear();