#!/usr/bin/env python3
import os, json, textwrap
print("Houston Ultimate v3.1 bootstrap\n")
need = ["AIRNOW_API_KEY","PURPLEAIR_API_KEY","AQICN_API_KEY","METRO_VEHICLE_POS_URL","METRO_TRIP_UPDATES_URL"]
missing = [k for k in need if not os.environ.get(k)]
print("Missing env (safe if DEMO_MODE=true):", ", ".join(missing) or "none")
print("""
Next steps:
 1) Copy .env.example → .env and fill keys.
 2) Start: `uvicorn apis.app:app --reload --port 8000`
 3) Open /docs. Try /transtar/incidents, /nws/alerts, /purpleair/top_sensors.
 4) Enable GitHub Action to archive data.
""")
