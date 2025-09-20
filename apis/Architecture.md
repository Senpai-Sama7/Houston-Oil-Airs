# Houston Live Data APIs — Full Guide & Drop‑in Integration Pack

This guide gives you **all the APIs** we discussed (traffic, cameras, flood gauges, air quality, radar, transit, bike share, aviation weather, etc.), plus a **ready-to-drop integration scaffold** for your `Houston‑Oil‑Airs` repo:

- A lightweight **FastAPI service** that proxies/normalizes each source to clean JSON.
- **GitHub Actions** jobs to pull and archive snapshots on a schedule (creating a versioned “API by Git” history under `/data`).
- **Usage instructions** for every endpoint: what it is, how it works, why it exists, who typically uses it.

> Tip: You can copy/paste the code blocks directly into files inside your repo and push. Adjust API keys in repo **Secrets**.

---

## 0) Repo layout (suggested)

```
.
├─ apis/
│  ├─ app.py                 # FastAPI server (local dev / container deploy)
│  ├─ sources/
│  │  ├─ transtar.py         # Houston TranStar feeds
│  │  ├─ metro_gtfsrt.py     # METRO GTFS‑realtime
│  │  ├─ bcycle_gbfs.py      # Houston BCycle GBFS
│  │  ├─ usgs_water.py       # USGS Water Services
│  │  ├─ ndbc.py             # NOAA NDBC buoys
│  │  ├─ nws_nowcast.py      # NWS Weather/Alerts + radar tiles index
│  │  ├─ aviation.py         # AviationWeather METAR/TAF
│  │  ├─ aqicn.py            # AQICN API
│  │  ├─ airnow.py           # AirNow API
│  │  └─ purpleair.py        # PurpleAir API
│  └─ utils.py               # shared HTTP client, caching, helpers
├─ data/                     # auto‑archived snapshots
├─ .github/workflows/
│  └─ archive_feeds.yml      # scheduled puller → commits JSON/CSV
└─ README.md
```

---

## 1) Common setup

### 1.1. Secrets (GitHub → Settings → Secrets and variables → **Actions** → **New repository secret**)

Set these if you’ll use the associated sources:

- `AIRNOW_API_KEY`
- `PURPLEAIR_API_KEY`
- `AQICN_API_KEY` (token)
- `METRO_API_KEY` (if required by portal product)

No key needed for: TranStar sample feeds, USGS Water Services, NWS/nowCOAST (rate limits apply), NDBC (be civil), BCycle GBFS.

### 1.2. Python dependencies

Add this to `requirements.txt` (or `pyproject.toml`):

```
fastapi
uvicorn
httpx
pydantic
python-dateutil
```

---

## 2) FastAPI service (proxy/normalize)

Create `apis/app.py`:

```python
from fastapi import FastAPI, HTTPException
from apis.sources import transtar, metro_gtfsrt, bcycle_gbfs, usgs_water, ndbc, nws_nowcast, aviation, aqicn, airnow, purpleair

app = FastAPI(title="Houston Live Data Proxy", version="1.0")

@app.get("/health")
def health():
    return {"ok": True}

# ---- Traffic & flooding ----
@app.get("/transtar/speedsegments")
async def transtar_speedsegments():
    return await transtar.get_speedsegments()

@app.get("/transtar/incidents")
async def transtar_incidents():
    return await transtar.get_incidents()

@app.get("/transtar/lane_closures")
async def transtar_lane_closures():
    return await transtar.get_lane_closures()

@app.get("/transtar/roadway_flood_warnings")
async def transtar_flood_warnings():
    return await transtar.get_flood_warnings()

# ---- Transit ----
@app.get("/metro/vehicle_positions")
async def metro_vehicle_positions():
    return await metro_gtfsrt.get_vehicle_positions()

@app.get("/metro/trip_updates")
async def metro_trip_updates():
    return await metro_gtfsrt.get_trip_updates()

# ---- Bike share ----
@app.get("/bcycle/station_status")
async def bcycle_station_status():
    return await bcycle_gbfs.get_station_status()

# ---- Hydrology ----
@app.get("/usgs/sites")
async def usgs_sites(county_code: str = "201", state: str = "TX"):
    return await usgs_water.list_sites(state=state, county=county_code)

@app.get("/usgs/timeseries")
async def usgs_timeseries(site: str, parameter: str = "00065", period: str = "P1D"):
    return await usgs_water.get_timeseries(site, parameter, period)

# ---- Marine ----
@app.get("/ndbc/latest")
async def ndbc_latest(station: str = "42035"):
    return await ndbc.fetch_latest(station)

# ---- Weather & radar ----
@app.get("/nws/forecast")
async def nws_forecast(lat: float, lon: float):
    return await nws_nowcast.get_forecast(lat, lon)

@app.get("/nws/alerts")
async def nws_alerts(area: str = "TXZ213"):
    return await nws_nowcast.get_alerts(area)

@app.get("/radar/tilespec")
async def radar_tilespec():
    return nws_nowcast.nexrad_tilespec()

# ---- Aviation ----
@app.get("/aviation/metar")
async def aviation_metar(icao: str = "KIAH"):
    return await aviation.get_metar(icao)

# ---- Air quality ----
@app.get("/aqicn/city")
async def aqicn_city(city: str = "Houston"):
    return await aqicn.city_feed(city)

@app.get("/airnow/observations")
async def airnow_obs(zipcode: str = "77002"):
    return await airnow.observations(zipcode)

@app.get("/purpleair/sensor")
async def purpleair_sensor(sensor_index: int):
    return await purpleair.sensor(sensor_index)
```

Create `apis/utils.py`:

```python
import os, asyncio
import httpx

TIMEOUT = 30

async def get_json(url: str, headers: dict | None = None, params: dict | None = None):
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(url, headers=headers or {}, params=params or {})
        r.raise_for_status()
        return r.json()

async def get_text(url: str):
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.text

ENV = os.environ.get
```

Then create each `apis/sources/*.py` module. **Minimal implementations** are provided below. You can extend schemas as needed.

### 2.1. Houston TranStar (`apis/sources/transtar.py`)

```python
from apis.utils import get_json
BASE = "https://traffic.houstontranstar.org/api"

async def get_speedsegments():
    # Sample JSON (prod requires access approval)
    return await get_json(f"{BASE}/speedsegments_sample.json")

async def get_incidents():
    return await get_json(f"{BASE}/incidents_sample.json")

async def get_lane_closures():
    return await get_json(f"{BASE}/laneclosures_sample.json")

async def get_flood_warnings():
    return await get_json(f"{BASE}/roadwayfloodwarning_sample.json")
```

**What/How/Why/Who**
- **What:** Real‑time operations data: speeds, incidents, closures, roadway flood risk.
- **How:** Feeds generated by TranStar’s roadway sensors & operators; refreshed ~minutely.
- **Why:** Traveler information, incident response, performance monitoring.
- **Who:** Commuter apps, DOT ops centers, research labs, city dashboards.

### 2.2. METRO GTFS‑realtime (`apis/sources/metro_gtfsrt.py`)

```python
import os
from apis.utils import get_text

# Replace with product URLs from the METRO developer portal once you enroll.
# Many GTFS‑rt feeds are protobuf; return raw bytes or convert to JSON with gtfs‑realtime‑bindings if desired.
VEHICLE_POS_URL = os.environ.get("METRO_VEHICLE_POS_URL", "")
TRIP_UPDATES_URL = os.environ.get("METRO_TRIP_UPDATES_URL", "")
HEADERS = {"Ocp-Apim-Subscription-Key": os.environ.get("METRO_API_KEY", "")} if os.environ.get("METRO_API_KEY") else {}

async def get_vehicle_positions():
    if not VEHICLE_POS_URL:
        return {"error": "Set METRO_VEHICLE_POS_URL env to your GTFS‑rt endpoint"}
    data = await get_text(VEHICLE_POS_URL)
    return {"protobuf_base64": data.encode("latin1").hex()}  # or decode with gtfs lib

async def get_trip_updates():
    if not TRIP_UPDATES_URL:
        return {"error": "Set METRO_TRIP_UPDATES_URL env to your GTFS‑rt endpoint"}
    data = await get_text(TRIP_UPDATES_URL)
    return {"protobuf_base64": data.encode("latin1").hex()}
```

**What/How/Why/Who**
- **What:** Live bus/rail positions and trip updates (delays, arrivals).
- **How:** GTFS‑realtime protobuf feeds from METRO’s API portal; key + feed URLs per product.
- **Why:** Rider apps, headway analytics, service reliability studies.
- **Who:** Transit apps, agencies, mobility researchers.

### 2.3. Houston BCycle GBFS (`apis/sources/bcycle_gbfs.py`)

```python
from apis.utils import get_json

# Discover GBFS auto‑discovery endpoint for Houston BCycle (operator may vary).
# If auto‑discovery is not available, set STATION_STATUS_URL directly.
AUTO = "https://GBFS.bcycle.com/bcycle_houston/gbfs.json"  # try this first; adjust if needed

async def get_station_status():
    # Try autodiscovery → station_status
    try:
        meta = await get_json(AUTO)
        url = meta["data"]["en"]["feeds"][1]["url"]  # typically the station_status feed
        return await get_json(url)
    except Exception:
        return {"error": "Update AUTO to the correct Houston BCycle GBFS URL"}
```

**What/How/Why/Who**
- **What:** Bike share station availability in real time (docks, bikes, e‑assist etc.).
- **How:** GBFS JSON feeds; no key; standard schema.
- **Why:** Trip planning, station balancing analytics, city mobility KPIs.
- **Who:** Routing apps, operators, civic dashboards.

### 2.4. USGS Water Services (`apis/sources/usgs_water.py`)

```python
from apis.utils import get_json

BASE = "https://api.waterdata.usgs.gov/ogcapi/v0"

async def list_sites(state: str, county: str):
    # Harris County = 201; filter by state & county FIPS using OGC API where clauses if needed
    url = f"{BASE}/collections/monitoring-locations/items?f=json&state=US:TX&county=US:48{county}"
    return await get_json(url)

async def get_timeseries(site: str, parameter: str, period: str):
    # parameter 00065 = gage height (example); period like P1D, P7D
    url = (
        f"{BASE}/collections/observations/observations?f=json"
        f"&monitoringLocation=USGS-{site}&parameterCode={parameter}&period={period}"
    )
    return await get_json(url)
```

**What/How/Why/Who**
- **What:** Stream stage/flow and other hydrologic timeseries + site metadata.
- **How:** Modern OGC API and related endpoints.
- **Why:** Flood risk analysis, watershed studies, infrastructure ops.
- **Who:** Flood control districts, hydrologists, researchers.

### 2.5. NOAA NDBC buoys (`apis/sources/ndbc.py`)

```python
from apis.utils import get_text

async def fetch_latest(station: str):
    # NDBC text products; parse client‑side or leave as raw for consumers
    url = f"https://www.ndbc.noaa.gov/data/latest_obs/{station}.txt"
    return {"station": station, "raw": await get_text(url)}
```

**What/How/Why/Who**
- **What:** Marine observations (winds, waves, pressure, etc.) and some BuoyCAM imagery.
- **How:** Station text/CSV endpoints per buoy; simple HTTP.
- **Why:** Coastal ops, marine safety, offshore planning.
- **Who:** Mariners, ports, weather apps, researchers.

### 2.6. NWS weather & radar (`apis/sources/nws_nowcast.py`)

```python
from apis.utils import get_json

NWS = "https://api.weather.gov"

async def get_forecast(lat: float, lon: float):
    # Two-step: points → forecast URL → forecast JSON
    meta = await get_json(f"{NWS}/points/{lat},{lon}")
    forecast_url = meta["properties"]["forecast"]
    return await get_json(forecast_url)

async def get_alerts(area: str):
    return await get_json(f"{NWS}/alerts/active/zone/{area}")

def nexrad_tilespec():
    # Provide well-known nowCOAST NEXRAD tile template for clients to use
    return {
        "template": "https://nowcoast.noaa.gov/arcgis/rest/services/radar/fdradnat/MapServer/tile/{z}/{y}/{x}",
        "attribution": "NOAA nowCOAST",
    }
```

**What/How/Why/Who**
- **What:** Forecasts, alerts, and a tile URL for radar mosaics.
- **How:** NWS JSON‑LD API + nowCOAST tile services.
- **Why:** Public safety, planning, incident response.
- **Who:** Anyone needing authoritative weather data.

### 2.7. Aviation weather (`apis/sources/aviation.py`)

```python
from apis.utils import get_json

BASE = "https://www.connect.aviationweather.gov/data/api"

async def get_metar(icao: str):
    # AWC data API; query parameters can filter by station & time range
    url = f"{BASE}/metar?ids={icao}&format=json"
    return await get_json(url)
```

**What/How/Why/Who**
- **What:** METAR/TAF and other aviation weather products for IAH/HOU/etc.
- **How:** AWC machine‑to‑machine API (JSON), last ~15 days.
- **Why:** Flight ops, UAV/UTA planning, weather awareness.
- **Who:** Pilots, dispatchers, drone operators, researchers.

### 2.8. AQICN (`apis/sources/aqicn.py`)

```python
import os
from apis.utils import get_json

TOKEN = os.environ.get("AQICN_API_KEY", "")
BASE = "https://api.waqi.info/feed"

async def city_feed(city: str):
    if not TOKEN:
        return {"error": "Set AQICN_API_KEY env"}
    return await get_json(f"{BASE}/{city}/?token={TOKEN}")
```

**What/How/Why/Who**
- **What:** City/station AQI feed as a complement to AirNow/low‑cost sensors.
- **How:** Simple REST with token.
- **Why:** Public health info, route choice, comms.
- **Who:** Consumer apps, dashboards, analysts.

### 2.9. AirNow (`apis/sources/airnow.py`)

```python
import os
from apis.utils import get_json

KEY = os.environ.get("AIRNOW_API_KEY", "")
BASE = "https://www.airnowapi.org/aq/observation/zipCode/current/"

async def observations(zipcode: str):
    if not KEY:
        return {"error": "Set AIRNOW_API_KEY env"}
    params = {"format": "application/json", "zipCode": zipcode, "distance": 25, "API_KEY": KEY}
    # AirNow expects querystring params
    return await get_json(BASE, params=params)
```

**What/How/Why/Who**
- **What:** Real‑time AQI & pollutant obs/forecasts.
- **How:** REST with API key; JSON/CSV.
- **Why:** Health comms, situational awareness, app UIs.
- **Who:** Public, agencies, developers.

### 2.10. PurpleAir (`apis/sources/purpleair.py`)

```python
import os
from apis.utils import get_json

KEY = os.environ.get("PURPLEAIR_API_KEY", "")
BASE = "https://api.purpleair.com/v1/sensors"
HEADERS = {"X-API-Key": KEY} if KEY else {}

async def sensor(sensor_index: int):
    if not KEY:
        return {"error": "Set PURPLEAIR_API_KEY env"}
    # Request a single sensor’s fields
    params = {"show": sensor_index, "fields": "name,latitude,longitude,pm2.5_atm,humidity,temperature"}
    return await get_json(BASE, headers=HEADERS, params=params)
```

**What/How/Why/Who**
- **What:** Hyper‑local PM readings from community sensors.
- **How:** REST + API key.
- **Why:** Neighborhood‑level AQ insights; event smoke, fire, dust.
- **Who:** Community orgs, researchers, citizens, apps.

---

## 3) Run the service locally

```bash
uvicorn apis.app:app --reload --port 8000
# Try in a browser:
# http://localhost:8000/transtar/incidents
# http://localhost:8000/nws/forecast?lat=29.76&lon=-95.37
# http://localhost:8000/aqicn/city?city=Houston
```

---

## 4) GitHub Actions archiver (snapshots → `/data`)

Create `.github/workflows/archive_feeds.yml`:

```yaml
name: Archive Feeds
on:
  schedule:
    - cron: '*/10 * * * *'  # every 10 minutes (timing not guaranteed)
  workflow_dispatch: {}

jobs:
  pull:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: |
          pip install httpx python-dateutil
      - name: Pull feeds
        env:
          AIRNOW_API_KEY: ${{ secrets.AIRNOW_API_KEY }}
          PURPLEAIR_API_KEY: ${{ secrets.PURPLEAIR_API_KEY }}
          AQICN_API_KEY: ${{ secrets.AQICN_API_KEY }}
          METRO_API_KEY: ${{ secrets.METRO_API_KEY }}
          METRO_VEHICLE_POS_URL: ${{ secrets.METRO_VEHICLE_POS_URL }}
          METRO_TRIP_UPDATES_URL: ${{ secrets.METRO_TRIP_UPDATES_URL }}
        run: |
          python - <<'PY'
          import os, json, time, pathlib, httpx
          from datetime import datetime, timezone

          def dump(name, data):
              ts = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
              outdir = pathlib.Path('data')/name
              outdir.mkdir(parents=True, exist_ok=True)
              with open(outdir/(ts+'.json'), 'w') as f:
                  json.dump(data, f)

          async def jget(url, headers=None, params=None):
              async with httpx.AsyncClient(timeout=30) as c:
                  r = await c.get(url, headers=headers, params=params)
                  r.raise_for_status()
                  try:
                      return r.json()
                  except Exception:
                      return {"raw": r.text}

          import asyncio
          async def main():
              # TranStar samples
              base = 'https://traffic.houstontranstar.org/api'
              for path in ['incidents_sample.json','laneclosures_sample.json','roadwayfloodwarning_sample.json','speedsegments_sample.json']:
                  dump('transtar_'+path.split('_')[0], await jget(f"{base}/{path}"))

              # NWS alerts for Houston metro zone example (update zone as needed)
              dump('nws_alerts', await jget('https://api.weather.gov/alerts/active/area/TX'))

              # OpenAQ Houston latest
              dump('openaq_houston', await jget('https://api.openaq.org/v3/latest?city=Houston'))

              # AirNow (needs key)
              key = os.environ.get('AIRNOW_API_KEY')
              if key:
                  dump('airnow_77002', await jget('https://www.airnowapi.org/aq/observation/zipCode/current/', params={
                      'format':'application/json','zipCode':'77002','distance':25,'API_KEY':key
                  }))

              # PurpleAir (needs key + sensor id)
              pkey = os.environ.get('PURPLEAIR_API_KEY')
              if pkey:
                  dump('purpleair_sample', await jget('https://api.purpleair.com/v1/sensors', headers={'X-API-Key':pkey}, params={'fields':'name,latitude,longitude,pm2.5_atm','max_age':600,'limit':50}))

              # USGS example: recent observations for a Harris Co site (replace)
              dump('usgs_sites', await jget('https://api.waterdata.usgs.gov/ogcapi/v0/collections/monitoring-locations/items?f=json&state=US:TX&county=US:48201'))

              # NDBC latest observation for Galveston 42035
              async with httpx.AsyncClient(timeout=30) as c:
                  r = await c.get('https://www.ndbc.noaa.gov/data/latest_obs/42035.txt'); r.raise_for_status()
                  dump('ndbc_42035', { 'raw': r.text })

              # METRO GTFS-rt (if provided)
              vurl = os.environ.get('METRO_VEHICLE_POS_URL'); turl = os.environ.get('METRO_TRIP_UPDATES_URL'); key = os.environ.get('METRO_API_KEY')
              headers={'Ocp-Apim-Subscription-Key': key} if key else {}
              if vurl:
                  async with httpx.AsyncClient(timeout=30) as c:
                      r = await c.get(vurl, headers=headers); r.raise_for_status(); dump('metro_vehicle_positions', {'protobuf_hex': r.content.hex()})
              if turl:
                  async with httpx.AsyncClient(timeout=30) as c:
                      r = await c.get(turl, headers=headers); r.raise_for_status(); dump('metro_trip_updates', {'protobuf_hex': r.content.hex()})

          asyncio.run(main())
          PY
      - name: Commit
        run: |
          git config user.name 'github-actions'; git config user.email 'actions@users.noreply.github.com'
          git add -A
          git commit -m "chore(data): archive feeds" || echo "nothing to commit"
          git push
```

**Why archive?** Creates a tamper‑evident history that’s easy to diff/plot, even if live APIs rate‑limit or change.

---

## 5) Endpoint quick‑reference

**Traffic & Cameras**
- `GET /transtar/speedsegments` – roadway segment speeds & travel times (sample)
- `GET /transtar/incidents` – active incidents with categories & geometry (sample)
- `GET /transtar/lane_closures` – scheduled closures (sample)
- `GET /transtar/roadway_flood_warnings` – high‑risk locations (sample)

**Transit (GTFS‑realtime)**
- `GET /metro/vehicle_positions` – protobuf payload (bus locations)
- `GET /metro/trip_updates` – protobuf payload (ETA/alerts)

**Bike share (GBFS)**
- `GET /bcycle/station_status` – live station bikes/docks

**Hydrology**
- `GET /usgs/sites?state=TX&county=201` – Harris County monitoring sites
- `GET /usgs/timeseries?site=#####&parameter=00065&period=P1D` – recent gage height

**Marine**
- `GET /ndbc/latest?station=42035` – latest buoy text

**Weather & Radar**
- `GET /nws/forecast?lat=29.76&lon=-95.37` – 7‑day forecast periods
- `GET /nws/alerts?area=TXZ213` – active NWS alerts for a forecast zone
- `GET /radar/tilespec` – nowCOAST NEXRAD XYZ tile template

**Aviation**
- `GET /aviation/metar?icao=KIAH` – latest METAR as JSON

**Air Quality**
- `GET /aqicn/city?city=Houston` – AQI feed for Houston
- `GET /airnow/observations?zipcode=77002` – current AQ observations
- `GET /purpleair/sensor?sensor_index=XXXX` – selected PurpleAir sensor fields

---

## 6) Who uses these & common use‑cases

- **Traffic/Transit:** DOTs, agencies, nav apps → congestion detection, reliability KPIs, traveler info.
- **Hydrology/Weather/Radar:** Flood control, emergency management, utilities → situational awareness, response.
- **Marine:** Ports, offshore operators → marine safety, routing, operations.
- **Air Quality (regulatory + community):** Public health, community orgs, researchers → exposure analysis, alerts.

---

## 7) Notes on ethics, rate limits, and terms

- Respect published rate limits and caching headers; set user‑agent strings.
- Attribute sources in UI/metadata; retain disclaimers where required.
- Avoid rehosting tiles when unnecessary—link to authoritative sources or cache lightly with attribution.

---

## 8) Next steps (optional hardening)

- Add **response schema validators** (Pydantic models) per endpoint.
- Use a **background scheduler** (APScheduler) to prefetch/cold‑cache.
- Containerize with a slim Python base; deploy to Fly.io, Railway, or Cloud Run.
- Add Grafana/Loki for metrics & logs if hosting the proxy.

---

## 9) Troubleshooting

- **GTFS‑rt shows gibberish:** It’s a protobuf stream. Decode with `gtfs-realtime-bindings` libraries; here we return hex for transport.
- **PurpleAir empty data:** Ensure `PURPLEAIR_API_KEY` is set and a valid `sensor_index` is used.
- **AirNow 403:** Verify API key and request parameters (zip, distance, format).
- **NWS 503 or 429:** Back off and cache. The API is cache‑friendly; respect `Cache-Control`.

---

You’re set. Drop these files in, set secrets, and you’ll have a working proxy + scheduled data archiver for Houston‑area sensors, cameras, radars, and more.

