import os, time, logging, json, asyncio
import httpx
from aiocache import cached, SimpleMemoryCache
from aiolimiter import AsyncLimiter
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

LOG_LEVEL = os.environ.get("LOG_LEVEL","INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format='%(message)s')
logger = logging.getLogger("houston")

TIMEOUT = int(os.environ.get("HTTP_TIMEOUT","30"))
CACHE_TTL = int(os.environ.get("CACHE_TTL","60"))

# Global limiter (fallback)
GLOBAL_RPS = float(os.environ.get("RATE_LIMIT_RPS","5"))
global_limiter = AsyncLimiter(max_rate=GLOBAL_RPS, time_period=1)

# Per-host limiters
limits_json = os.environ.get("RATE_LIMITS_JSON","{}")
try:
    PER_HOST = {k: AsyncLimiter(v, 1) for k,v in json.loads(limits_json).items()}
except Exception:
    PER_HOST = {}

def _limiter_for(url: str):
    try:
        host = httpx.URL(url).host
        return PER_HOST.get(host, global_limiter)
    except Exception:
        return global_limiter

@retry(reraise=True, stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
       retry=retry_if_exception_type(httpx.HTTPError))
@cached(ttl=CACHE_TTL, cache=SimpleMemoryCache)
async def get_json(url: str, headers: dict | None = None, params: dict | None = None):
    limiter = _limiter_for(url)
    async with limiter:
        async with httpx.AsyncClient(timeout=TIMEOUT, headers=headers or {}) as client:
            r = await client.get(url, params=params or {})
            r.raise_for_status()
            return r.json()

@retry(reraise=True, stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
       retry=retry_if_exception_type(httpx.HTTPError))
@cached(ttl=CACHE_TTL, cache=SimpleMemoryCache)
async def get_text(url: str, headers: dict | None = None, params: dict | None = None):
    limiter = _limiter_for(url)
    async with limiter:
        async with httpx.AsyncClient(timeout=TIMEOUT, headers=headers or {}) as client:
            r = await client.get(url, params=params or {})
            r.raise_for_status()
            return r.text
