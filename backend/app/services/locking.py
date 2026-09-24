"""Distributed and thread-safe in-memory seat concurrency locking with TTL."""

import logging
import threading
import time
from typing import List
from app.services.cache import is_redis_online, redis_client

logger = logging.getLogger(__name__)

HOLD_TTL_SECONDS = 300  # 5 minutes

# In-memory lock store: "show_id:seat_id" -> (user_id/lock_val, expire_time)
_lock_store: dict[str, tuple[any, float]] = {}
_lock_mutex = threading.Lock()


def _cleanup_expired_memory_locks():
    """Remove expired memory locks."""
    now = time.time()
    expired = [k for k, (_, exp) in _lock_store.items() if now >= exp]
    for k in expired:
        del _lock_store[k]


def get_seat_lock_key(show_id: int, seat_id: int) -> str:
    """Generate a deterministic key for a specific seat in a show."""
    return f"seat_lock:{show_id}:{seat_id}"


def hold_seats(show_id: int, user_id: any, seat_ids: List[int]) -> bool:
    """
    Attempt to acquire a lock for multiple seats atomically.
    Fails entirely if any single seat is already held.
    """
    if not seat_ids:
        return True

    # 1. Try Redis if online
    if is_redis_online() and redis_client:
        try:
            pipeline = redis_client.pipeline()
            for seat_id in seat_ids:
                key = get_seat_lock_key(show_id, seat_id)
                pipeline.set(key, str(user_id), nx=True, ex=HOLD_TTL_SECONDS)
            results = pipeline.execute()

            # If all were acquired successfully
            if all(results):
                logger.info(f"Successfully held seats {seat_ids} for show {show_id} via Redis.")
                return True

            # Rollback acquired locks if any failed
            logger.warning(f"Lock collision for show {show_id}, releasing partial holds.")
            rel_pipeline = redis_client.pipeline()
            for seat_id, acquired in zip(seat_ids, results):
                if acquired:
                    rel_pipeline.delete(get_seat_lock_key(show_id, seat_id))
            rel_pipeline.execute()
            return False
        except Exception as e:
            logger.warning(f"Redis hold_seats error ({e}), falling back to memory locks.")

    # 2. In-memory locking with mutex
    with _lock_mutex:
        _cleanup_expired_memory_locks()
        now = time.time()

        # Check if any seat is already locked
        for seat_id in seat_ids:
            key = f"{show_id}:{seat_id}"
            if key in _lock_store:
                _, exp = _lock_store[key]
                if now < exp:
                    logger.warning(f"Seat {seat_id} is already held in memory.")
                    return False

        # Acquire all
        expire_at = now + HOLD_TTL_SECONDS
        for seat_id in seat_ids:
            key = f"{show_id}:{seat_id}"
            _lock_store[key] = (str(user_id), expire_at)

        logger.info(f"Successfully held seats {seat_ids} for show {show_id} via in-memory lock.")
        return True


def release_seats(show_id: int, seat_ids: List[int]) -> None:
    """Release holds for a list of seats."""
    if not seat_ids:
        return

    # 1. Redis
    if is_redis_online() and redis_client:
        try:
            pipeline = redis_client.pipeline()
            for seat_id in seat_ids:
                pipeline.delete(get_seat_lock_key(show_id, seat_id))
            pipeline.execute()
        except Exception as e:
            logger.warning(f"Redis release error: {e}")

    # 2. In-memory
    with _lock_mutex:
        for seat_id in seat_ids:
            key = f"{show_id}:{seat_id}"
            _lock_store.pop(key, None)


def get_held_seat_ids(show_id: int) -> List[int]:
    """Retrieve all currently locked show_seat IDs for a given show."""
    held = set()

    # 1. Redis
    if is_redis_online() and redis_client:
        try:
            pattern = f"seat_lock:{show_id}:*"
            keys = redis_client.keys(pattern)
            for key in keys:
                parts = key.split(":")
                if len(parts) >= 3:
                    held.add(int(parts[-1]))
        except Exception as e:
            logger.warning(f"Redis get_held_seat_ids error: {e}")

    # 2. In-memory
    with _lock_mutex:
        _cleanup_expired_memory_locks()
        now = time.time()
        for k, (_, exp) in _lock_store.items():
            if now < exp:
                prefix, s_id = k.split(":")
                if prefix == str(show_id):
                    held.add(int(s_id))

    return list(held)


def is_seat_held(show_id: int, seat_id: int) -> bool:
    """Check if a specific seat is held."""
    # 1. Redis
    if is_redis_online() and redis_client:
        try:
            if redis_client.get(get_seat_lock_key(show_id, seat_id)):
                return True
        except Exception:
            pass

    # 2. In-memory
    with _lock_mutex:
        now = time.time()
        key = f"{show_id}:{seat_id}"
        if key in _lock_store:
            _, exp = _lock_store[key]
            if now < exp:
                return True
            del _lock_store[key]

    return False