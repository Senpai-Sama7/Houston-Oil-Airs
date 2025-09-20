from fastapi import FastAPI
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
