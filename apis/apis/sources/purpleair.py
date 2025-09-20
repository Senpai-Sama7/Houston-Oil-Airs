import os
from apis.utils import get_json

KEY = os.environ.get("PURPLEAIR_API_KEY","")
BASE = "https://api.purpleair.com/v1/sensors"
HEADERS = {"X-API-Key": KEY} if KEY else {}

async def sensor(sensor_index: int):
    if not KEY:
        return {"error": "Set PURPLEAIR_API_KEY env"}
    params = {"show": sensor_index, "fields": "name,latitude,longitude,pm2.5_atm,humidity,temperature"}
    return await get_json(BASE, headers=HEADERS, params=params)
