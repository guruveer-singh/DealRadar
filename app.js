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
// savings      = how many ₹ you save
// savingsPct   = savings as a % of the market price
// dealScore    = 0..100 score. 40% savings or more = a perfect 100.
function withStats(p) {
  const savings = p.market - p.dutyFree;
  const savingsPct = (savings / p.market) * 100;
  const dealScore = Math.min(100, Math.round(savingsPct * 2.5));

  // priceChange: if the collector recorded what the price was last time,
  // we can show whether it went up or down. (0 / undefined = no change info)
  const priceChange = p.previousDutyFree ? p.dutyFree - p.previousDutyFree : 0;

  return { ...p, savings, savingsPct, dealScore, priceChange };
}

const ALL = PRODUCTS.map(withStats);

// The score above which a card gets the 🔥 "top deal" ribbon
const HOT_SCORE = 85;

// ---- 4. Give each score a colour + label ----
function scoreTier(score) {
  if (score >= 80) return { label: "Great deal", cls: "great" };
  if (score >= 60) return { label: "Good deal",  cls: "good" };
  return { label: "Okay", cls: "okay" };
}

// ---- 5. Current state of the filters ----
let activeCategory = "All";
let searchText = "";
let sortMode = "score"; // "score" | "savings" | "price"

// ---- 6. Build one product card as HTML ----
function cardHTML(p) {
  const tier = scoreTier(p.dealScore);
  const hot = p.dealScore >= HOT_SCORE;

  // price direction arrow (only shows if the collector saved a previous price)
  let changeHTML = "";
  if (p.priceChange < 0) {
    changeHTML = `<span class="change change--down">▼ ${rupees(-p.priceChange)} cheaper than last check</span>`;
  } else if (p.priceChange > 0) {
    changeHTML = `<span class="change change--up">▲ ${rupees(p.priceChange)} costlier than last check</span>`;
  }

  return `
    <article class="card ${hot ? "card--hot" : ""}">
      ${hot ? `<div class="ribbon">🔥 TOP DEAL</div>` : ""}
      <div class="card__top">
        <span class="card__emoji">${p.emoji}</span>
        <span class="badge badge--${tier.cls}" title="Deal Score">${p.dealScore}</span>
      </div>
      <h3 class="card__name">${p.name}</h3>
      <p class="card__meta">${p.brand} · ${p.size}</p>

      <div class="prices">
        <div class="price price--df">
          <span class="price__label">Duty Free</span>
          <span class="price__value">${rupees(p.dutyFree)}</span>
        </div>
        <div class="price price--mkt">
          <span class="price__label">Market</span>
          <span class="price__value strike">${rupees(p.market)}</span>
        </div>
      </div>

      <!-- savings bar: fills up according to savings % -->
      <div class="bar" title="${Math.round(p.savingsPct)}% cheaper than market">
        <div class="bar__fill bar__fill--${tier.cls}" style="width:${Math.min(100, p.savingsPct * 2.5)}%"></div>
      </div>

      <div class="card__foot">
        <span class="save">Save ${rupees(p.savings)} (${Math.round(p.savingsPct)}%)</span>
        <span class="tier tier--${tier.cls}">${tier.label}</span>
      </div>
      ${changeHTML}
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
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
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
        <p>😕 Nothing matches “${searchText}”.</p>
        <button class="chip" onclick="clearSearch()">Clear search</button>
      </div>`;
  } else {
    grid.innerHTML = list.map(cardHTML).join("");
  }

  // update headline stats
  const totalSave = list.reduce((sum, p) => sum + p.savings, 0);
  const best = list.length ? list.reduce((a, b) => (b.dealScore > a.dealScore ? b : a)) : null;
  document.getElementById("count").textContent = list.length;
  document.getElementById("totalSave").textContent = rupees(totalSave);
  document.getElementById("bestDeal").textContent = best ? best.name : "—";
}

// used by the empty-state button
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
      buildCategoryButtons(); // re-draw so the active one highlights
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
buildCategoryButtons();
showFreshness();
render();
