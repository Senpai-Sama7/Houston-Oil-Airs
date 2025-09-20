from apis.utils import get_json
NWS = "https://api.weather.gov"

async def get_forecast(lat: float, lon: float):
    meta = await get_json(f"{NWS}/points/{lat},{lon}")
    forecast_url = meta["properties"]["forecast"]
    return await get_json(forecast_url)

async def get_alerts(area: str):
    return await get_json(f"{NWS}/alerts/active/zone/{area}")

def nexrad_tilespec():
    return {
        "template": "https://nowcoast.noaa.gov/arcgis/rest/services/radar/fdradnat/MapServer/tile/{z}/{y}/{x}",
        "attribution": "NOAA nowCOAST"
    }
