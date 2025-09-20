#!/usr/bin/env bash
set -euo pipefail
export DEMO_MODE=true
uvicorn apis.app:app --reload --port 8000
