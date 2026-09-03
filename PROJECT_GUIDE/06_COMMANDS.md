# 6. Commands

Run these from the project root unless a command says otherwise.

## Open the static app

```powershell
Start-Process ".\index.html"
```

Or double-click `index.html` in File Explorer.

## Install declared dependencies

```powershell
npm install
```

The active collector uses built-in Node `fetch`. Playwright is declared but is not required by the current Amazon scraper.

## Run the full collector

```powershell
Set-Location ".\collector"
node collector.js
```

Expected stages are Amazon searches, market-data loading, seven DDF category searches, a matched count, and a `data.js` write.

## Test Amazon only

```powershell
Set-Location ".\collector"
node amazon-scraper.js
```

This prints extracted prices as JSON. A 403, 503, or zero results means Amazon blocked or changed the response; it does not necessarily mean your Node installation is broken.

## Test DDF API only

```powershell
Set-Location ".\collector"
node test-api.js
```

This is a diagnostic request and does not update the app.

## Test liquor records

```powershell
Set-Location ".\collector"
node liquor-mrp-fetcher.js
```

This prints the manually maintained liquor records and their attribution.

## Validate catalog JSON

```powershell
Get-Content ".\collector\market-prices.json" -Raw | ConvertFrom-Json | Select-Object -ExpandProperty Count
```

The command should print the number of entries.

## Count products by category

```powershell
$catalog = Get-Content ".\collector\market-prices.json" -Raw | ConvertFrom-Json
$catalog | Group-Object category | Select-Object Name, Count
```

## Check JavaScript syntax without network calls

```powershell
node --check ".\collector\collector.js"
node --check ".\collector\amazon-scraper.js"
node --check ".\collector\liquor-mrp-fetcher.js"
node --check ".\app.js"
```

## Inspect generated output

```powershell
Get-Content ".\data.js" -TotalCount 35
```

Never edit generated output to permanently change a product. Change the source catalog or collector code and regenerate it.

## Enable daily GitHub updates

The workflow file is `.github/workflows/update-prices.yml`.

1. On GitHub, open `Settings` -> `Secrets and variables` -> `Actions`.
2. Add a repository secret named `CONTRIBUTION_EMAIL`.
3. Set its value to the verified email connected to your GitHub account. Do not put the email in source code.
4. Optionally add a repository variable named `CONTRIBUTION_NAME`.
5. Open the `Actions` tab, select `Update DealRadar prices`, and choose `Run workflow`.

The scheduled run is daily at 06:00 UTC, which is 11:30 AM India Standard Time. The workflow needs repository Actions write permission to push `data.js`.
