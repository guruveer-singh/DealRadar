# 5. Data and Matching

## Catalog entry

A catalog entry looks like this:

```json
{
  "keywords": ["dior", "sauvage"],
  "brand": "Dior",
  "size": "100 ml",
  "marketPrice": 10500,
  "category": "Perfumes"
}
```

All keywords must match. For example, `Dior Sauvage Eau de Toilette` matches `dior` and `sauvage`.

The comparison is case-insensitive, but it is literal substring matching. `whiskey` and `whisky` are different strings. Punctuation, spelling, pack size, and product variants can therefore affect results.

## DDF item after mapping

`fetchCategory()` converts an API item into:

```text
{
  name,
  sku,
  category,
  dutyFree,
  currency,
  url
}
```

The URL is built from the DDF site plus `url_key + ".html"`.

## Output product in `data.js`

Each selected product contains:

- `name`, `brand`, `category`, `size`
- `dutyFree`: fetched DDF final price
- `dutyFreeSource`: DDF attribution
- `dutyFreeLastUpdated`: collector timestamp
- `market`: matched market price
- `marketSource`, `marketSourceUrl`, `marketLastVerified`
- `emoji`: category display icon
- `previousDutyFree`: prior generated price when available
- `url`: DDF product page

## Deal calculations

In the browser:

```text
savings = market - dutyFree
savingsPct = savings / market * 100
dealScore = min(100, round(savingsPct * 2.5))
```

A negative savings value means the Duty Free price is higher than the market reference. The current UI still displays the calculation, so interpret the result carefully.

## How to add a catalog product

1. Open `collector/market-prices.json`.
2. Add one valid JSON object before the closing `]`.
3. Use several distinctive lowercase keywords.
4. Keep one exact product variant per entry when pack sizes differ.
5. Run the JSON validation command from `06_COMMANDS.md`.
6. Run `node collector.js`.
7. Check the matched count and inspect `data.js`.

Do not use an overly broad keyword such as only `apple`, because it may match unrelated products. Put the more specific entry first when two entries could match the same name.
