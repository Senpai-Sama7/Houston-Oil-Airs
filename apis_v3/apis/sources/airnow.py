import os
from apis.utils import get_json
KEY = os.environ.get("AIRNOW_API_KEY","")
BASE = "https://www.airnowapi.org/aq/observation/zipCode/current/"
async def observations(zipcode: str):
    if not KEY:
        return {"error": "Set AIRNOW_API_KEY env"}
    params = {"format":"application/json","zipCode": zipcode, "distance": 25, "API_KEY": KEY}
    return await get_json(BASE, params=params)
