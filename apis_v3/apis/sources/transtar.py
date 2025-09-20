from apis.utils import get_json
BASE = "https://traffic.houstontranstar.org/api"

async def get_speedsegments():
    return await get_json(f"{BASE}/speedsegments_sample.json")

async def get_incidents():
    return await get_json(f"{BASE}/incidents_sample.json")

async def get_lane_closures():
    return await get_json(f"{BASE}/laneclosures_sample.json")

async def get_flood_warnings():
    return await get_json(f"{BASE}/roadwayfloodwarning_sample.json")
