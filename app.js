/* DealRadar: the catalogue stays in data.js; this file only controls its display. */
const PAGE_SIZE = 24;
const HOT_SCORE = 85;
let ALL = [];
let filteredList = [];
let currentPage = 1;
let activeCategory = "All";
let searchText = "";
let sortMode = "score";

function rupees(value) {
  return Number.isFinite(value)
    ? "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : "—";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? escapeHTML(url.href) : "";
  } catch {
    return "";
  }
}

function timeAgo(isoString) {
  const then = new Date(isoString).getTime();
  if (!Number.isFinite(then)) return "date unavailable";
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function withStats(product) {
  const dutyFree = Number(product.dutyFree);
  const market = Number(product.market);
  const hasMarket = Number.isFinite(market) && market > 0
    && Number.isFinite(dutyFree) && dutyFree > 0;
  const savings = hasMarket ? market - dutyFree : 0;
  const savingsPct = hasMarket ? savings / market * 100 : 0;
  const dealScore = hasMarket
    ? Math.min(100, Math.max(0, Math.round(savingsPct * 2.5)))
    : null;
  const previous = Number(product.previousDutyFree);
  const priceChange = Number.isFinite(previous) && previous > 0 ? dutyFree - previous : 0;
  return { ...product, dutyFree, market, hasMarket, savings, savingsPct, dealScore, priceChange };
}

function scoreTier(score) {
  if (score === null) return { label: "Not compared", cls: "okay" };
  if (score >= 80) return { label: "Great deal", cls: "great" };
  if (score >= 60) return { label: "Good deal", cls: "good" };
  return { label: "Small saving", cls: "okay" };
}

function cardHTML(p) {
  let tier = scoreTier(p.dealScore);
  if (p.hasMarket && p.savings < 0) tier = { label: "Lower in market", cls: "negative" };
  if (p.hasMarket && p.savings === 0) tier = { label: "Same price", cls: "okay" };
  const hot = p.hasMarket && p.dealScore >= HOT_SCORE;
  const marketURL = p.hasMarket ? safeURL(p.marketSourceUrl) : "";
  const productURL = safeURL(p.url);
  const savingsLabel = !p.hasMarket ? "Market reference unavailable"
    : p.savings > 0 ? `Save ${rupees(p.savings)} (${Math.round(p.savingsPct)}%)`
    : p.savings < 0 ? `${rupees(-p.savings)} more at Duty Free`
    : "No price difference";
  const ribbon = p.isExclusive
    ? '<div class="ribbon ribbon--exclusive">✈ Airport exclusive</div>'
    : hot ? '<div class="ribbon">✦ Top deal</div>' : "";
  const change = p.priceChange === 0 ? ""
    : `<span class="change change--${p.priceChange < 0 ? "down" : "up"}">${p.priceChange < 0 ? "↓" : "↑"} ${rupees(Math.abs(p.priceChange))} ${p.priceChange < 0 ? "less" : "more"} than last check</span>`;
  const bar = p.hasMarket
    ? `<div class="bar" role="img" aria-label="Deal score: ${p.dealScore} out of 100"><div class="bar__fill bar__fill--${tier.cls}" style="width:${p.dealScore}%"></div></div>`
    : '<div class="bar bar--unrated" aria-hidden="true"></div>';
  const source = p.hasMarket ? p.marketSource || "Market reference" : "Delhi Duty Free catalogue";
  return `<article class="card${hot ? " card--hot" : ""}">
    <div class="card__ribbon-slot">${ribbon}</div>
    <div class="card__top">
      <span class="card__emoji" aria-hidden="true">${escapeHTML(p.emoji || "✦")}</span>
      <span class="badge badge--${tier.cls}" title="${p.hasMarket ? "Deal score out of 100, based on the market reference" : "No market reference available"}">${p.hasMarket ? `<span class="sr-only">Deal score </span>${p.dealScore}<small>/100</small>` : "Unrated"}</span>
    </div>
    <h3 class="card__name">${escapeHTML(p.name)}</h3>
    <p class="card__meta">${escapeHTML([p.brand, p.size || "1 unit"].filter(Boolean).join(" · "))}</p>
    <div class="prices">
      <div class="price price--df"><span class="price__label">Duty Free</span><span class="price__value">${rupees(p.dutyFree)}</span></div>
      <div class="price price--mkt"><span class="price__label">Market ref.</span><span class="price__value${p.hasMarket ? "" : " price__value--missing"}">${p.hasMarket ? rupees(p.market) : "Not available"}</span></div>
    </div>
    ${bar}
    <div class="card__foot">
      <span class="save${!p.hasMarket ? " save--neutral" : p.savings < 0 ? " save--negative" : ""}">${savingsLabel}</span>
      ${p.hasMarket ? `<span class="tier tier--${tier.cls}">${tier.label}</span>` : ""}
    </div>
    <div class="card__bottom">
      <div class="card__source"><span title="${escapeHTML(source)}">${escapeHTML(source)}</span>${marketURL ? `<a href="${marketURL}" target="_blank" rel="noopener noreferrer" aria-label="View market source for ${escapeHTML(p.name)}">View source ↗</a>` : ""}</div>
      ${change}
      ${p.needsVerification ? '<p class="card__notice">Market reference needs verification.</p>' : ""}
      ${productURL ? `<a class="card__link" href="${productURL}" target="_blank" rel="noopener noreferrer" aria-label="Check ${escapeHTML(p.name)} at Delhi Duty Free">Check at Delhi Duty Free <span aria-hidden="true">↗</span></a>` : ""}
    </div>
  </article>`;
}

function matchesSearch(product) {
  const words = searchText.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const text = [product.name, product.brand, product.category, product.size].join(" ").toLowerCase();
  return words.every(word => text.includes(word));
}

function compareDeals(a, b) {
  // Unrated listings follow actual comparisons, including comparisons with no saving.
  return Number(b.hasMarket) - Number(a.hasMarket) || (b.dealScore ?? -1) - (a.dealScore ?? -1);
}

function render() {
  const searched = ALL.filter(matchesSearch);
  const list = searched.filter(p => activeCategory === "All" || p.category === activeCategory);
  if (sortMode === "score") list.sort(compareDeals);
  if (sortMode === "savings") list.sort((a, b) => Number(b.hasMarket) - Number(a.hasMarket) || b.savings - a.savings);
  if (sortMode === "price") list.sort((a, b) => a.dutyFree - b.dutyFree);
  filteredList = list;
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);
  const grid = document.getElementById("grid");
  if (!list.length) {
    const query = searchText.trim();
    grid.innerHTML = `<div class="empty">
      <span class="empty__icon" aria-hidden="true">⌕</span>
      <h3>${ALL.length ? "No products found" : "The catalogue is unavailable"}</h3>
      <p>${!ALL.length ? "We couldn’t load the price snapshot. Please reload the page to try again."
        : query ? `Nothing matches “${escapeHTML(query)}”${activeCategory === "All" ? "" : ` in ${escapeHTML(activeCategory)}`}. Try another search or reset your filters.`
        : `There are no products in ${escapeHTML(activeCategory)}. Try another category.`}</p>
      ${ALL.length ? '<button class="button button--small" data-reset-filters>Reset filters</button>' : '<button class="button button--small" data-reload>Reload page</button>'}
    </div>`;
  } else {
    grid.innerHTML = pageItems.map(cardHTML).join("");
  }
  renderRange(list.length, start, pageItems.length);
  buildPager(totalPages);
  updateCategoryButtons(searched);
  document.getElementById("clearSearch").hidden = searchText.length === 0;
  document.getElementById("resetFilters").hidden = !searchText && activeCategory === "All" && sortMode === "score";
  const compared = list.filter(p => p.hasMarket);
  const totalSave = compared.reduce((sum, p) => sum + Math.max(0, p.savings), 0);
  const best = compared.filter(p => p.savings > 0).sort(compareDeals)[0];
  document.getElementById("count").textContent = list.length.toLocaleString("en-IN");
  document.getElementById("totalSave").textContent = compared.length ? rupees(totalSave) : "—";
  const bestEl = document.getElementById("bestDeal");
  bestEl.textContent = best ? best.name : "No saving to compare";
  bestEl.title = best ? best.name : "No positive savings against a market reference in this selection";
}

function renderRange(total, start, shown) {
  const label = total === 1 ? "product" : "products";
  document.getElementById("showrange").textContent = total
    ? `Showing ${start + 1}–${start + shown} of ${total.toLocaleString("en-IN")} ${label}`
    : "No products to show";
}

function pageNumbers(totalPages, current) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const from = Math.max(2, Math.min(current - 1, totalPages - 3));
  const to = Math.min(totalPages - 1, Math.max(current + 1, 4));
  const numbers = [1];
  if (from > 2) numbers.push("…");
  for (let page = from; page <= to; page++) numbers.push(page);
  if (to < totalPages - 1) numbers.push("…");
  numbers.push(totalPages);
  return numbers;
}

function buildPager(totalPages) {
  const pager = document.getElementById("pager");
  pager.hidden = totalPages <= 1;
  if (totalPages <= 1) { pager.innerHTML = ""; return; }
  const arrow = (label, page, name, disabled) => `<button type="button" class="page__arrow" data-page="${page}" aria-label="${name}"${disabled ? " disabled" : ""}>${label}</button>`;
  pager.innerHTML = [
    arrow("‹", currentPage - 1, "Previous page", currentPage === 1),
    ...pageNumbers(totalPages, currentPage).map(page => page === "…"
      ? '<span class="page__gap" aria-hidden="true">…</span>'
      : `<button type="button" data-page="${page}"${page === currentPage ? ' aria-current="page"' : ""} aria-label="Page ${page} of ${totalPages}">${page}</button>`),
    arrow("›", currentPage + 1, "Next page", currentPage === totalPages),
  ].join("");
}

function gotoPage(page) {
  if (!Number.isFinite(page)) return;
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const target = Math.min(Math.max(1, Math.trunc(page)), totalPages);
  if (target === currentPage) return;
  currentPage = target;
  render();
  scrollToControls();
  document.getElementById("showrange").focus({ preventScroll: true });
}

function scrollToControls() {
  const toolbar = document.getElementById("toolbar");
  const grid = document.getElementById("grid");
  if (!toolbar || !grid) return;
  const top = Math.max(0, window.scrollY + grid.getBoundingClientRect().top - toolbar.offsetHeight - 20);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduceMotion ? "instant" : "smooth" });
}

function clearSearch() {
  searchText = "";
  document.getElementById("search").value = "";
  currentPage = 1;
  render();
  document.getElementById("search").focus();
}

function resetFilters() {
  activeCategory = "All";
  searchText = "";
  sortMode = "score";
  currentPage = 1;
  document.getElementById("search").value = "";
  document.getElementById("sort").value = "score";
  render();
  document.getElementById("search").focus();
}

function buildCategoryButtons() {
  const categories = ["All", ...new Set(ALL.map(p => p.category))];
  document.getElementById("categories").innerHTML = categories.map(category =>
    `<button type="button" class="chip" data-cat="${escapeHTML(category)}" aria-pressed="false">${escapeHTML(category)} <span class="chip__count"></span></button>`
  ).join("");
}

function updateCategoryButtons(searched) {
  document.querySelectorAll("#categories .chip").forEach(button => {
    const category = button.dataset.cat;
    const count = category === "All" ? searched.length : searched.filter(p => p.category === category).length;
    button.querySelector(".chip__count").textContent = count.toLocaleString("en-IN");
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.classList.toggle("chip--on", category === activeCategory);
  });
}

function showFreshness() {
  const element = document.getElementById("updated");
  const timestamp = typeof LAST_UPDATED !== "undefined" ? LAST_UPDATED : null;
  const date = timestamp ? new Date(timestamp) : new Date(NaN);
  const liveSource = typeof DATA_SOURCE !== "undefined" && DATA_SOURCE === "live";
  element.classList.remove("updated--stale", "updated--recent");
  if (!liveSource || !Number.isFinite(date.getTime())) {
    element.classList.add("updated--stale");
    element.textContent = liveSource ? "Price update date unavailable" : "Sample catalogue · prices are illustrative";
    return;
  }
  const stale = Date.now() - date.getTime() > 48 * 60 * 60 * 1000;
  element.classList.add(stale ? "updated--stale" : "updated--recent");
  const dateLabel = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  element.innerHTML = `<span class="updated__date">Updated <time datetime="${escapeHTML(timestamp)}">${escapeHTML(dateLabel)}</time> · ${timeAgo(timestamp)}</span>${stale ? '<span class="updated__note">Older snapshot. Confirm current prices before buying.</span>' : ""}`;
  element.title = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
}

function initDealRadar() {
  ALL = typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS)
    ? PRODUCTS.map(withStats).filter(p => Number.isFinite(p.dutyFree) && p.dutyFree > 0)
    : [];
  buildCategoryButtons();
  showFreshness();
  render();
}

// About only needs the shared footer; dashboard controls are wired on the catalogue page.
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

if (document.getElementById("grid")) {
  document.getElementById("search").addEventListener("input", event => {
    searchText = event.target.value;
    currentPage = 1;
    render();
  });
  document.getElementById("sort").addEventListener("change", event => {
    sortMode = event.target.value;
    currentPage = 1;
    render();
  });
  document.getElementById("categories").addEventListener("click", event => {
    const button = event.target.closest("button[data-cat]");
    if (!button) return;
    activeCategory = button.dataset.cat;
    currentPage = 1;
    render();
  });
  document.getElementById("pager").addEventListener("click", event => {
    const button = event.target.closest("button[data-page]");
    if (button && !button.disabled) gotoPage(Number(button.dataset.page));
  });
  document.getElementById("clearSearch").addEventListener("click", clearSearch);
  document.getElementById("resetFilters").addEventListener("click", resetFilters);
  document.getElementById("grid").addEventListener("click", event => {
    if (event.target.closest("[data-reset-filters]")) resetFilters();
    if (event.target.closest("[data-reload]")) window.location.reload();
  });
  initDealRadar();
}
