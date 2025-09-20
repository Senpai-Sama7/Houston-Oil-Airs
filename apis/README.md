# Houston Ultimate Live Data API Pack

Drop-in scaffold to proxy and archive **Houston-area live data**: traffic (TranStar), transit (METRO GTFS-rt), bike share (GBFS), hydrology (USGS), marine (NDBC), weather/alerts/radar (NWS/nowCOAST), aviation (AWC), and air quality (AirNow, PurpleAir, AQICN).

## Contents
- `apis/app.py` — FastAPI service exposing normalized endpoints.
- `apis/utils.py` — shared HTTP helpers.
- `apis/sources/` — one module per upstream source.
- `.github/workflows/archive_feeds.yml` — scheduled archiver committing JSON snapshots into `/data`.
- `requirements.txt`

## Quick start
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn apis.app:app --reload --port 8000
# Open http://localhost:8000/docs
```

## Configure secrets (if using GitHub Actions)
Repository → **Settings** → **Secrets and variables** → **Actions**:

- `AIRNOW_API_KEY`
- `PURPLEAIR_API_KEY`
- `AQICN_API_KEY`
- `METRO_API_KEY` (if required)
- `METRO_VEHICLE_POS_URL` (GTFS-rt Vehicle Positions endpoint)
- `METRO_TRIP_UPDATES_URL` (GTFS-rt Trip Updates endpoint)

## What/How/Why/Who (per source)
- **TranStar (traffic/flood warnings)** — minute-level roadway telemetry for speeds, incidents, closures, and roadway flood warnings. Public sample JSON feeds; production access by request. *Why*: operations, traveler info, performance monitoring. *Who*: DOTs, nav apps, researchers.
- **METRO GTFS‑rt (transit)** — protobuf feeds: vehicle positions, trip updates, alerts. *Why*: real-time rider info and reliability analytics. *Who*: transit apps, agencies.
- **BCycle GBFS (bike share)** — open JSON for station status/availability. *Why*: micromobility planning, dashboards. *Who*: operators, routing apps.
- **USGS Water Services** — OGC/REST for stream stage/flow and other timeseries. *Why*: flood risk, watershed ops. *Who*: hydrologists, emergency mgmt.
- **NWS / nowCOAST (weather & radar)** — forecasts and alerts JSON; NEXRAD mosaic tiles for radar. *Why*: situational awareness. *Who*: public safety, utilities.
- **NDBC (marine)** — buoy observations (text/CSV). *Why*: marine safety. *Who*: ports, mariners.
- **Aviation Weather (AWC)** — METAR/TAF API. *Why*: flight ops, drones. *Who*: pilots, dispatchers.
- **AirNow** — real-time AQ obs/forecasts (API key). *Why*: public health comms. *Who*: agencies, apps.
- **PurpleAir** — hyper‑local PM sensors (API key). *Why*: neighborhood AQ, smoke/dust events. *Who*: community orgs, citizens.
- **AQICN (WAQI)** — city/station AQI (token). *Why*: supplemental AQ index. *Who*: consumer apps.

## Legal & rate limits
Respect upstream ToS/rate limits and attribution. Cache where possible; set a custom User-Agent. nowCOAST tiles are best consumed directly as XYZ tiles; avoid heavy rehosting.

## Archiver
Enable the included GitHub Action (`archive_feeds.yml`) to snapshot feeds every 10 minutes into `/data/<source>/<timestamp>.json` so you keep a versioned “API by Git”.

