const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const now = Date.parse("2026-10-16T12:00:00Z");
class Clock extends Date { static now() { return now; } }

// A small DOM boundary lets these tests exercise the real event handlers without dependencies.
function element() {
  const classes = new Set();
  return {
    innerHTML: "", textContent: "", value: "", hidden: false, title: "",
    offsetHeight: 170, listeners: {}, focused: false,
    classList: {
      add: (...values) => values.forEach(value => classes.add(value)),
      remove: (...values) => values.forEach(value => classes.delete(value)),
      contains: value => classes.has(value),
    },
    addEventListener(name, handler) { this.listeners[name] = handler; },
    focus() { this.focused = true; },
    getBoundingClientRect() { return { top: 300 }; },
  };
}

function load({ dashboard = true, products = [] } = {}) {
  const ids = dashboard
    ? ["year", "grid", "search", "sort", "categories", "pager", "clearSearch", "resetFilters", "updated", "showrange", "count", "totalSave", "bestDeal", "toolbar"]
    : ["year"];
  const elements = Object.fromEntries(ids.map(id => [id, element()]));
  const context = vm.createContext({
    URL, Date: Clock, PRODUCTS: products, DATA_SOURCE: "live", LAST_UPDATED: "2026-09-13T06:30:25.455Z",
    document: {
      getElementById: id => elements[id] || null,
      querySelectorAll: () => [],
      querySelector: () => null,
    },
    window: { scrollY: 0, matchMedia: () => ({ matches: true }), scrollTo() {}, location: { reload() {} } },
  });
  vm.runInContext(source, context);
  return { elements, run: code => vm.runInContext(code, context) };
}

const catalogue = Array.from({ length: 80 }, (_, i) => ({
  name: `Widget ${i}`, brand: "Test brand", category: i % 2 ? "Liquor" : "Perfumes",
  size: "100 ml", dutyFree: 500 + i, market: i % 3 ? 1000 : null,
}));

test("About opens without a catalogue or dashboard elements", () => {
  const app = load({ dashboard: false });
  assert.match(String(app.elements.year.textContent), /^\d{4}$/);
});

test("missing market prices and exclusives are unrated", () => {
  const app = load({ dashboard: false });
  assert.equal(app.run("withStats({ dutyFree: 500, market: null, isExclusive: true }).dealScore"), null);
  assert.equal(app.run("withStats({ dutyFree: 500, market: Infinity }).hasMarket"), false);
  const card = app.run("cardHTML(withStats({ name: 'Exclusive', dutyFree: 500, isExclusive: true }))");
  assert.match(card, /Airport exclusive/);
  assert.match(card, /Unrated/);
  assert.doesNotMatch(card, /Save ₹0|Live|Great deal/);
});

test("savings, percentages and score caps use real comparisons", () => {
  const app = load({ dashboard: false });
  assert.equal(app.run("withStats({ dutyFree: 600, market: 1000 }).savings"), 400);
  assert.equal(app.run("withStats({ dutyFree: 600, market: 1000 }).savingsPct"), 40);
  assert.equal(app.run("withStats({ dutyFree: 100, market: 1000 }).dealScore"), 100);
  const card = app.run("cardHTML(withStats({ name: 'Costlier', dutyFree: 1100, market: 1000 }))");
  assert.match(card, /₹100 more at Duty Free/);
  assert.match(card, /Lower in market/);
  assert.doesNotMatch(card, /Save ₹-|line-through|cheaper than market/);
});

test("unrated listings cannot outrank market comparisons", () => {
  const app = load({ products: [
    { name: "Unrated exclusive", dutyFree: 500, isExclusive: true },
    { name: "Compared product", dutyFree: 1000, market: 900 },
  ] });
  assert.equal(app.run("filteredList[0].name"), "Compared product");
  assert.equal(app.elements.bestDeal.textContent, "No saving to compare");
});

test("search, category and sort changes all start at page one", () => {
  const app = load({ products: catalogue });
  app.run("gotoPage(3)");
  assert.match(app.elements.showrange.textContent, /49–72/);
  app.elements.search.listeners.input({ target: { value: "  Widget   " } });
  assert.match(app.elements.showrange.textContent, /1–24 of 80/);
  app.run("gotoPage(3)");
  app.elements.categories.listeners.click({ target: { closest: () => ({ dataset: { cat: "Liquor" } }) } });
  assert.match(app.elements.showrange.textContent, /1–24 of 40/);
  app.run("gotoPage(2)");
  app.elements.sort.listeners.change({ target: { value: "price" } });
  assert.match(app.elements.showrange.textContent, /1–24 of 40/);
  assert.equal(app.run("filteredList[0].dutyFree"), 501);
});

test("reset recovers an empty category/search combination and returns focus", () => {
  const app = load({ products: catalogue });
  app.elements.search.listeners.input({ target: { value: "Nonexistent" } });
  assert.match(app.elements.grid.innerHTML, /No products found/);
  assert.equal(app.elements.pager.hidden, true);
  app.elements.resetFilters.listeners.click();
  assert.match(app.elements.showrange.textContent, /1–24 of 80/);
  assert.equal(app.elements.search.value, "");
  assert.equal(app.elements.search.focused, true);
  assert.equal(app.elements.resetFilters.hidden, true);
});

test("multiword search ignores extra whitespace and includes sizes and categories", () => {
  const app = load({ products: catalogue });
  app.elements.search.listeners.input({ target: { value: "  LIQUOR  100 ml  " } });
  assert.equal(app.run("filteredList.length"), 40);
});

test("search text and catalogue fields render as text, with safe outbound links", () => {
  const app = load({ products: catalogue });
  app.elements.search.listeners.input({ target: { value: '<img src=x onerror="alert(1)">' } });
  assert.doesNotMatch(app.elements.grid.innerHTML, /<img/);
  assert.match(app.elements.grid.innerHTML, /&lt;img/);
  const card = app.run("cardHTML(withStats({ name: '<script>unsafe</script>', dutyFree: 500, market: 900, url: 'javascript:alert(1)', marketSourceUrl: 'javascript:alert(1)' }))");
  assert.doesNotMatch(card, /<script>|href="javascript:/);
  assert.match(card, /&lt;script&gt;/);
});

test("pagination covers boundary and middle pages without duplicates or invalid pages", () => {
  const app = load({ dashboard: false });
  for (let total = 1; total <= 55; total++) {
    for (let current = 1; current <= total; current++) {
      const pages = Array.from(app.run(`pageNumbers(${total}, ${current})`)).filter(page => typeof page === "number");
      assert.equal(pages[0], 1);
      assert.equal(pages.at(-1), total);
      assert.ok(pages.includes(current));
      assert.equal(new Set(pages).size, pages.length);
      assert.ok(pages.every(page => page >= 1 && page <= total));
    }
  }
});

test("stale data shows its date and never claims to be live", () => {
  const app = load({ products: catalogue });
  assert.equal(app.elements.updated.classList.contains("updated--stale"), true);
  assert.match(app.elements.updated.innerHTML, /Older snapshot/);
  assert.doesNotMatch(app.elements.updated.innerHTML, /Live prices/);
  assert.equal(app.run("timeAgo('bad date')"), "date unavailable");
  assert.equal(app.run("timeAgo('2026-10-16T11:01:00Z')"), "59 min ago");
});

test("missing data has a recovery state and invalid product prices are excluded", () => {
  const app = load();
  assert.match(app.elements.grid.innerHTML, /catalogue is unavailable/);
  assert.match(app.elements.grid.innerHTML, /Reload page/);
  const invalid = load({ products: [{ name: "Invalid", dutyFree: "unknown" }, { name: "Valid", dutyFree: 500 }] });
  assert.equal(invalid.run("ALL.length"), 1);
});

test("real saved catalogue renders without dropping valid listings", () => {
  const dataContext = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8") + "\nthis.catalogue = PRODUCTS;", dataContext);
  const app = load({ products: dataContext.catalogue });
  assert.equal(app.run("ALL.length"), dataContext.catalogue.length);
  assert.equal((app.elements.grid.innerHTML.match(/<article class="card/g) || []).length, 24);
  app.run("gotoPage(999)");
  assert.equal(app.run("currentPage"), Math.ceil(dataContext.catalogue.length / 24));
});
