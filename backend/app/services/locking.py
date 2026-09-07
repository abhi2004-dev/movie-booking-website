"""Redis-backed concurrency control for temporary seat holds."""

from typing import List
import logging
from app.services.cache import redis_client

logger = logging.getLogger(__name__)

HOLD_TTL_SECONDS = 300  # 5 minutes


def get_seat_lock_key(show_id: int, seat_id: int) -> str:
    """Generate a deterministic Redis key for a specific seat in a show."""
    return f"lock:show:{show_id}:seat:{seat_id}"


def hold_seats(show_id: int, user_id: int, seat_ids: List[int]) -> bool:
    """
    Attempt to acquire a Redis lock for multiple seats atomically via a pipeline.
    Fails entirely if any single seat is already locked.
    """
    pipeline = redis_client.pipeline()
    
    # Pre-check all seats
    for seat_id in seat_ids:
        key = get_seat_lock_key(show_id, seat_id)
        if redis_client.exists(key):
            logger.warning(f"Seat {seat_id} is already held.")
            return False

    # Attempt to lock all seats
    for seat_id in seat_ids:
        key = get_seat_lock_key(show_id, seat_id)
        pipeline.set(key, user_id, nx=True, ex=HOLD_TTL_SECONDS)
    
    results = pipeline.execute()
    
    # If any SETNX operation failed (returned None/False), rollback locks
    if not all(results):
        logger.warning(f"Concurrency collision holding seats {seat_ids} for show {show_id}.")
        release_pipeline = redis_client.pipeline()
        for seat_id, acquired in zip(seat_ids, results):
            if acquired:
                key = get_seat_lock_key(show_id, seat_id)
                release_pipeline.delete(key)
        release_pipeline.execute()
        return False
        
    return True


def get_held_seat_ids(show_id: int) -> List[int]:
    """Retrieve all currently locked seat IDs for a given show."""
    pattern = f"lock:show:{show_id}:seat:*"
    keys = redis_client.keys(pattern)
    return [int(key.split(":")[-1]) for key in keys]