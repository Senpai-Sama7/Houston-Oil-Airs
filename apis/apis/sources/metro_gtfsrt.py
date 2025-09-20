import os
from apis.utils import get_text

VEHICLE_POS_URL = os.environ.get("METRO_VEHICLE_POS_URL", "")
TRIP_UPDATES_URL = os.environ.get("METRO_TRIP_UPDATES_URL", "")
HEADERS = {"Ocp-Apim-Subscription-Key": os.environ.get("METRO_API_KEY","")} if os.environ.get("METRO_API_KEY") else {}

async def get_vehicle_positions():
    if not VEHICLE_POS_URL:
        return {"error": "Set METRO_VEHICLE_POS_URL env to your GTFS‑rt endpoint"}
    data = await get_text(VEHICLE_POS_URL, headers=HEADERS)
    return {"protobuf_hex": data.encode("latin1").hex()}

async def get_trip_updates():
    if not TRIP_UPDATES_URL:
        return {"error": "Set METRO_TRIP_UPDATES_URL env to your GTFS‑rt endpoint"}
    data = await get_text(TRIP_UPDATES_URL, headers=HEADERS)
    return {"protobuf_hex": data.encode("latin1").hex()}
