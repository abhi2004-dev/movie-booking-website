"""Resilient caching layer with Redis support and in-memory TTL fallback."""

import json
import logging
import time
from typing import Any, Optional
import redis

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import socket

# In-memory fallback cache store: key -> (value, expiry_timestamp)
_memory_cache: dict[str, tuple[Any, float]] = {}
_redis_available = False

def _is_redis_port_open(host: str, port: int, timeout: float = 0.2) -> bool:
    try:
        s = socket.socket()
        s.settimeout(timeout)
        target_host = "127.0.0.1" if host == "localhost" else host
        res = s.connect_ex((target_host, port))
        s.close()
        return res == 0
    except Exception:
        return False

if _is_redis_port_open(settings.REDIS_HOST, settings.REDIS_PORT):
    try:
        redis_client = redis.Redis(
            host="127.0.0.1" if settings.REDIS_HOST == "localhost" else settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1,
            retry_on_timeout=False,
        )
        redis_client.ping()
        _redis_available = True
        logger.info("Redis connection established successfully.")
    except Exception as e:
        logger.warning(f"Redis is unavailable ({e}). Gracefully falling back to in-memory cache.")
        redis_client = None
        _redis_available = False
else:
    logger.info("Redis is offline. Gracefully falling back to in-memory cache.")
    redis_client = None
    _redis_available = False



def is_redis_online() -> bool:
    """Check if Redis connection is currently healthy."""
    global _redis_available
    if redis_client is None:
        return False
    try:
        redis_client.ping()
        _redis_available = True
        return True
    except Exception:
        _redis_available = False
        return False


def get_cached_data(key: str) -> Optional[Any]:
    """Retrieve and deserialize data from Redis or in-memory fallback."""
    # 1. Try Redis if available
    if is_redis_online() and redis_client:
        try:
            data = redis_client.get(key)
            if data:
                logger.info(f"CACHE HIT (Redis): {key}")
                return json.loads(data)
            logger.info(f"CACHE MISS (Redis): {key}")
            return None
        except Exception as e:
            logger.warning(f"Redis read error ({e}), checking memory cache.")

    # 2. In-memory cache fallback
    now = time.time()
    if key in _memory_cache:
        val, expiry = _memory_cache[key]
        if now < expiry:
            logger.info(f"CACHE HIT (Memory): {key}")
            return val
        else:
            del _memory_cache[key]

    logger.info(f"CACHE MISS: {key}")
    return None


def set_cached_data(key: str, value: Any, expire_seconds: int = 3600) -> None:
    """Serialize and store data in Redis or in-memory fallback with TTL."""
    # 1. Try Redis
    if is_redis_online() and redis_client:
        try:
            redis_client.setex(key, expire_seconds, json.dumps(value))
            return
        except Exception as e:
            logger.warning(f"Redis write error ({e}), saving to memory cache.")

    # 2. In-memory fallback
    expiry = time.time() + expire_seconds
    _memory_cache[key] = (value, expiry)