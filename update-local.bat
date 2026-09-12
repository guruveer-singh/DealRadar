@echo off
REM Daily local refresh for DealRadar.
REM Pulls the cloud-generated data first, regenerates it, and pushes if changed.
cd /d "D:\DutyFreeProject\DutyFreeProject old sample user"

git pull --rebase

node collector\collector.js
if errorlevel 1 (
  echo Collector failed - data.js was not refreshed, nothing committed.
  exit /b 1
)

git add data.js
git diff --cached --quiet
if %errorlevel%==0 (
  echo No data changes to commit.
  exit /b 0
)

git commit -m "chore: local price refresh"
git push origin main
