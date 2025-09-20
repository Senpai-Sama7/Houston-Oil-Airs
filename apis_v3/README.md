# Houston **Ultimate v3.1** Live Data API Pack

All-in-one, production-ready proxy + archiver for Houston live data with retries, per-host rate limits, caching, metrics, logs, Parquet/DuckDB, decoded GTFS‑rt, and Houston defaults.

## Quick start
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # set keys/URLs as needed
make run
# http://localhost:8000/docs | http://localhost:8000/metrics
```
Docker: `docker compose up --build`

## What’s new in v3.1
- **Per‑host rate limits** via `RATE_LIMITS_JSON` (env).
- **DEMO_MODE**: runs even without keys by using public samples and safe fallbacks.
- **PurpleAir `/purpleair/top_sensors`**: auto‑selects top‑N sensors by PM2.5 in a Houston bounding box.
- **Houston defaults** in `scripts/houston_defaults.json` (bbox, NWS zones, NDBC station).
- **Bootstrap script** `scripts/bootstrap_repo.py` to validate env, print next steps.
- **Makefile**, extra tests, and a tiny `scripts/demo_run.sh` helper.

## Configure
Set `.env` values (see `.env.example`). Keys for: AirNow, PurpleAir, AQICN, METRO (if required).

## Archive Jobs
Enable `.github/workflows/archive_feeds.yml` to snapshot feeds to `/data` and `/data_parquet`. Use `scripts/compact_duckdb.py` (from v3) if you want a DuckDB.

