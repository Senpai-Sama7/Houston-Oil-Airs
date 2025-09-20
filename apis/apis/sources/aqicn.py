import os
from apis.utils import get_json

TOKEN = os.environ.get("AQICN_API_KEY","")
BASE = "https://api.waqi.info/feed"

async def city_feed(city: str):
    if not TOKEN:
        return {"error": "Set AQICN_API_KEY env"}
    return await get_json(f"{BASE}/{city}/?token={TOKEN}")
