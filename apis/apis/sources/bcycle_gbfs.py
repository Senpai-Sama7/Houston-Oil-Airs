from apis.utils import get_json

AUTO = "https://GBFS.bcycle.com/bcycle_houston/gbfs.json"  # adjust if needed

async def get_station_status():
    try:
        meta = await get_json(AUTO)
        # Look for station_status feed
        feeds = meta["data"]["en"]["feeds"]
        station_status_url = None
        for f in feeds:
            if "station_status" in f.get("name","") or "station_status" in f.get("url",""):
                station_status_url = f["url"]
                break
        if not station_status_url and feeds:
            station_status_url = feeds[0]["url"]
        return await get_json(station_status_url)
    except Exception as e:
        return {"error": "Update AUTO to the correct Houston BCycle GBFS URL", "detail": str(e)}
