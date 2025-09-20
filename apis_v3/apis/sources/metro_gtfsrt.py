import os
from google.transit import gtfs_realtime_pb2
from apis.utils import get_text

VEHICLE_POS_URL = os.environ.get("METRO_VEHICLE_POS_URL", "")
TRIP_UPDATES_URL = os.environ.get("METRO_TRIP_UPDATES_URL", "")
HEADERS = {"Ocp-Apim-Subscription-Key": os.environ.get("METRO_API_KEY","")} if os.environ.get("METRO_API_KEY") else {}

def decode_feed(raw_bytes: bytes):
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(raw_bytes)
    entities = []
    for e in feed.entity:
        d = {"id": e.id}
        if e.HasField("vehicle"):
            v = e.vehicle
            d["vehicle"] = {
                "trip_id": getattr(getattr(v, "trip", None), "trip_id", None),
                "route_id": getattr(getattr(v, "trip", None), "route_id", None),
                "lat": getattr(getattr(v, "position", None), "latitude", None),
                "lon": getattr(getattr(v, "position", None), "longitude", None),
                "bearing": getattr(getattr(v, "position", None), "bearing", None),
                "timestamp": getattr(v, "timestamp", None),
                "stop_id": getattr(v, "stop_id", None),
                "current_stop_sequence": getattr(v, "current_stop_sequence", None),
            }
        if e.HasField("trip_update"):
            tu = e.trip_update
            d["trip_update"] = {
                "trip_id": getattr(getattr(tu, "trip", None), "trip_id", None),
                "route_id": getattr(getattr(tu, "trip", None), "route_id", None),
                "timestamp": getattr(tu, "timestamp", None),
                "stops": [{
                    "stop_id": u.stop_id,
                    "arrival": getattr(getattr(u, "arrival", None), "time", None),
                    "departure": getattr(getattr(u, "departure", None), "time", None),
                } for u in getattr(tu, "stop_time_update", [])]
            }
        entities.append(d)
    return {"entities": entities}

async def get_vehicle_positions():
    if not VEHICLE_POS_URL:
        return {"error": "Set METRO_VEHICLE_POS_URL env to your GTFS‑rt endpoint"}
    raw = await get_text(VEHICLE_POS_URL, headers=HEADERS)
    return decode_feed(raw.encode("latin1"))

async def get_trip_updates():
    if not TRIP_UPDATES_URL:
        return {"error": "Set METRO_TRIP_UPDATES_URL env to your GTFS‑rt endpoint"}
    raw = await get_text(TRIP_UPDATES_URL, headers=HEADERS)
    return decode_feed(raw.encode("latin1"))
