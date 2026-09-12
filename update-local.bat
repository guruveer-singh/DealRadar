@echo off
REM Daily local sync for DealRadar.
REM
REM Deliberately does NOT run the collector or push: the GitHub Action owns
REM data.js. If both your PC and the cloud job regenerated and pushed it, the
REM two generated files would conflict and produce a corrupted merge.
REM Pulling only keeps your local copy identical to what the live site serves.
cd /d "D:\DutyFreeProject\DutyFreeProject old sample user"

git pull --rebase

echo Local copy synced. Open index.html to see the latest prices.
