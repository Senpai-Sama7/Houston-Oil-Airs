from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import os, time

from apis.sources import transtar, metro_gtfsrt, bcycle_gbfs, usgs_water, ndbc, nws_nowcast, aviation, aqicn, airnow, purpleair

DEMO = os.environ.get("DEMO_MODE","true").lower() == "true"

tags = [
    {"name":"Traffic","description":"Houston TranStar feeds"},
    {"name":"Transit","description":"METRO GTFS-realtime"},
    {"name":"Bike Share","description":"GBFS feeds"},
    {"name":"Hydrology","description":"USGS Water Services"},
    {"name":"Marine","description":"NOAA NDBC"},
    {"name":"Weather","description":"NWS + nowCOAST radar"},
    {"name":"Aviation","description":"Aviation Weather Center"},
    {"name":"Air Quality","description":"AirNow, PurpleAir, AQICN"}
]

app = FastAPI(title="Houston Live Data Proxy", version="3.1", openapi_tags=tags,
              description="DEMO_MODE is {}. Set DEMO_MODE=false to require keys for all endpoints.".format(DEMO))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

REQS = Counter("http_requests_total", "HTTP requests", ["path","method","status"])
LAT = Histogram("http_request_duration_seconds", "Latency", ["path","method"])

@app.middleware("http")
async def m(request, call_next):
    t0 = time.time()
    try:
        resp = await call_next(request)
        status = resp.status_code
    except Exception:
        status = 500
        resp = PlainTextResponse("internal error", status_code=500)
    LAT.labels(request.url.path, request.method).observe(time.time()-t0)
    REQS.labels(request.url.path, request.method, str(status)).inc()
    return resp

@app.get("/metrics")
def metrics():
    return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/health")
def health():
    return {"ok": True, "demo_mode": DEMO}

# Traffic
@app.get("/transtar/speedsegments", tags=["Traffic"])
async def transtar_speedsegments():
    return await transtar.get_speedsegments()

@app.get("/transtar/incidents", tags=["Traffic"])
async def transtar_incidents():
    return await transtar.get_incidents()

@app.get("/transtar/lane_closures", tags=["Traffic"])
async def transtar_lane_closures():
    return await transtar.get_lane_closures()

@app.get("/transtar/roadway_flood_warnings", tags=["Traffic"])
async def transtar_flood_warnings():
    return await transtar.get_flood_warnings()

# Transit
@app.get("/metro/vehicle_positions", tags=["Transit"])
async def metro_vehicle_positions():
    return await metro_gtfsrt.get_vehicle_positions()

@app.get("/metro/trip_updates", tags=["Transit"])
async def metro_trip_updates():
    return await metro_gtfsrt.get_trip_updates()

# Bike share
@app.get("/bcycle/station_status", tags=["Bike Share"])
async def bcycle_station_status():
    return await bcycle_gbfs.get_station_status()

# Hydrology
@app.get("/usgs/sites", tags=["Hydrology"])
async def usgs_sites(county_code: str = "201", state: str = "TX"):
    return await usgs_water.list_sites(state=state, county=county_code)

@app.get("/usgs/timeseries", tags=["Hydrology"])
async def usgs_timeseries(site: str, parameter: str = "00065", period: str = "P1D"):
    return await usgs_water.get_timeseries(site, parameter, period)

# Marine
@app.get("/ndbc/latest", tags=["Marine"])
async def ndbc_latest(station: str = "42035"):
    return await ndbc.fetch_latest(station)

# Weather & radar
@app.get("/nws/forecast", tags=["Weather"])
async def nws_forecast(lat: float, lon: float):
    return await nws_nowcast.get_forecast(lat, lon)

@app.get("/nws/alerts", tags=["Weather"])
async def nws_alerts(area: str = "TXZ213"):
    return await nws_nowcast.get_alerts(area)

@app.get("/radar/tilespec", tags=["Weather"])
async def radar_tilespec():
    return nws_nowcast.nexrad_tilespec()

# Aviation
@app.get("/aviation/metar", tags=["Aviation"])
async def aviation_metar(icao: str = "KIAH"):
    return await aviation.get_metar(icao)

# Air Quality
@app.get("/aqicn/city", tags=["Air Quality"])
async def aqicn_city(city: str = "Houston"):
    return await aqicn.city_feed(city)

@app.get("/airnow/observations", tags=["Air Quality"])
async def airnow_obs(zipcode: str = "77002"):
    return await airnow.observations(zipcode)

@app.get("/purpleair/sensor", tags=["Air Quality"])
async def purpleair_sensor(sensor_index: int):
    return await purpleair.sensor(sensor_index)

@app.get("/purpleair/search_bbox", tags=["Air Quality"])
async def purpleair_search_bbox(nwlat: float = 30.20, nwlon: float = -95.90, selat: float = 29.40, selon: float = -94.90):
    return await purpleair.search_bbox(nwlat, nwlon, selat, selon)

@app.get("/purpleair/top_sensors", tags=["Air Quality"])
async def purpleair_top_sensors(nwlat: float = 30.20, nwlon: float = -95.90, selat: float = 29.40, selon: float = -94.90, limit: int = 20):
    return await purpleair.top_sensors(nwlat, nwlon, selat, selon, limit)
