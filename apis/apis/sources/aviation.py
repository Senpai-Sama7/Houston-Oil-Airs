from apis.utils import get_json

BASE = "https://www.connect.aviationweather.gov/data/api"

async def get_metar(icao: str):
    url = f"{BASE}/metar?ids={icao}&format=json"
    return await get_json(url)
