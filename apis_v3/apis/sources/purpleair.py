import os
from apis.utils import get_json
KEY = os.environ.get("PURPLEAIR_API_KEY","")
BASE = "https://api.purpleair.com/v1/sensors"
HEADERS = {"X-API-Key": KEY} if KEY else {}

def _rows(resp):
    fields = resp.get('fields', [])
    for row in resp.get('data', []):
        yield {fields[i]: row[i] for i in range(len(fields))}

async def sensor(sensor_index: int):
    if not KEY:
        return {"error": "Set PURPLEAIR_API_KEY env"}
    params = {"show": sensor_index, "fields": "name,latitude,longitude,pm2.5_atm,humidity,temperature"}
    return await get_json(BASE, headers=HEADERS, params=params)

async def search_bbox(nwlat: float, nwlon: float, selat: float, selon: float):
    if not KEY:
        return {"error": "Set PURPLEAIR_API_KEY env"}
    params = {"fields": "name,latitude,longitude,pm2.5_atm,humidity,temperature",
              "nwlat": nwlat, "nwlon": nwlon, "selat": selat, "selon": selon}
    return await get_json(BASE, headers=HEADERS, params=params)

async def top_sensors(nwlat: float, nwlon: float, selat: float, selon: float, limit: int):
    resp = await search_bbox(nwlat, nwlon, selat, selon)
    if 'data' not in resp:
        return resp
    rows = list(_rows(resp))
    rows = [r for r in rows if r.get('pm2.5_atm') is not None]
    rows.sort(key=lambda r: r.get('pm2.5_atm', 0), reverse=True)
    return {"count": len(rows), "top": rows[:max(1, int(limit))]}
