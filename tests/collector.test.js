const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../collector/collector.js'), 'utf8');

async function collect(failAt = Infinity, failureStatus = 500) {
  let calls = 0;
  let output;
  const sandbox = {
    __dirname: path.join(__dirname, '../collector'),
    require(name) {
      if (name === 'fs') return {
        readFileSync(file) {
          if (file.endsWith('market-prices.json')) return '[]';
          return 'const PRODUCTS = [{name:"Absolut Vodka 1 L", dutyFree:2000}];';
        },
        writeFileSync(file, value) { output = value; },
      };
      if (name === './liquor-mrp-fetcher') return { getOfficialLiquorMRP: () => [
        { name: 'Absolut Vodka', brand: 'Absolut', size: '1 L', mrp: 2600,
          lastVerified: '2025-08-15', needsVerification: true },
      ] };
      return require(name);
    },
    console: { log() {}, warn() {}, error() {} },
    AbortSignal,
    setTimeout(callback) { callback(); },
    process: { exit() { throw new Error('Unexpected exit'); } },
    async fetch(url, options) {
      assert.equal(url, 'https://delhidutyfree.co.in/graphql');
      assert.equal(options.method, 'POST');
      assert.ok(JSON.parse(options.body).query.includes('products('));
      calls++;
      if (calls === failAt && failureStatus === 'network') throw new TypeError('fetch failed');
      return { status: calls === failAt ? failureStatus : 200, ok: calls !== failAt,
        json: async () => ({ data: { products: { total_count: 1, items: [
          { name: 'Absolut Vodka 1 L', sku: 'a1', url_key: 'absolut',
            categories: [{ name: 'Liquor' }],
            price_range: { minimum_price: { final_price: { value: 2400, currency: 'INR' } } } },
        ] } } }),
      };
    },
  };
  const context = vm.createContext(sandbox);
  vm.runInContext(source.replace(/main\(\)\.catch\([\s\S]*$/, ''), context);
  await vm.runInContext('main()', context);
  return vm.runInNewContext(output + '; ({ PRODUCTS, LAST_UPDATED })');
}

test('refresh uses canonical endpoint, preserves previous price and flags old references', async () => {
  const result = await collect();
  assert.equal(result.PRODUCTS.length, 1);
  const product = result.PRODUCTS[0];
  assert.equal(product.dutyFree, 2400);
  assert.equal(product.previousDutyFree, 2000);
  assert.equal(product.needsVerification, true);
  assert.equal(product.marketLastVerified, '2025-08-15');
  assert.ok(Date.now() - Date.parse(result.LAST_UPDATED) < 10000);
});

test('a failed category rejects the refresh before writing any catalogue', async () => {
  await assert.rejects(collect(2), /Refresh incomplete — data.js NOT overwritten/);
});

test('a temporary connection failure can recover without losing collected prices', async () => {
  const result = await collect(2, 'network');
  assert.equal(result.PRODUCTS.length, 1);
  assert.equal(result.PRODUCTS[0].dutyFree, 2400);
});

test('access refusals stop the refresh immediately', async () => {
  await assert.rejects(collect(2, 403), /Site refused \(403\).*Stopping/);
  await assert.rejects(collect(2, 429), /Site refused \(429\).*Stopping/);
});
