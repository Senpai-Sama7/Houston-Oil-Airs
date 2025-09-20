from apis.utils import get_text

async def fetch_latest(station: str):
    url = f"https://www.ndbc.noaa.gov/data/latest_obs/{station}.txt"
    return {"station": station, "raw": await get_text(url)}
