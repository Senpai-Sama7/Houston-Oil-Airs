from apis.utils import get_json

BASE = "https://api.waterdata.usgs.gov/ogcapi/v0"

async def list_sites(state: str, county: str):
    url = f"{BASE}/collections/monitoring-locations/items?f=json&state=US:{state}&county=US:48{county}"
    return await get_json(url)

async def get_timeseries(site: str, parameter: str, period: str):
    url = (f"{BASE}/collections/observations/observations?f=json"
           f"&monitoringLocation=USGS-{site}&parameterCode={parameter}&period={period}")
    return await get_json(url)
