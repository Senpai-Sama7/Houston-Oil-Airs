import os
import httpx

TIMEOUT = 30

async def get_json(url: str, headers: dict | None = None, params: dict | None = None):
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=headers or {}) as client:
        r = await client.get(url, params=params or {})
        r.raise_for_status()
        return r.json()

async def get_text(url: str, headers: dict | None = None, params: dict | None = None):
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=headers or {}) as client:
        r = await client.get(url, params=params or {})
        r.raise_for_status()
        return r.text

ENV = os.environ.get
