"""Redis caching layer for external API requests."""

import json
import logging
from typing import Any, Optional
import redis

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True
)

def get_cached_data(key: str) -> Optional[Any]:
    """Retrieve and deserialize data from Redis, logging hit/miss ratios."""
    data = redis_client.get(key)
    if data:
        logger.info(f"CACHE HIT: {key}")
        return json.loads(data)
    
    logger.info(f"CACHE MISS: {key}")
    return None

def set_cached_data(key: str, value: Any, expire_seconds: int = 3600) -> None:
    """Serialize and store data in Redis with a TTL."""
    redis_client.setex(key, expire_seconds, json.dumps(value))