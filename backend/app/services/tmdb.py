"""External integration with TMDB API using HTTPX and Redis caching."""

import httpx
from fastapi import HTTPException
from typing import Dict, Any

from app.core.config import settings
from app.services.cache import get_cached_data, set_cached_data

TMDB_BASE_URL = "https://api.themoviedb.org/3"


def fetch_tmdb(endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
    """Fetch data from TMDB, checking the Redis cache first."""
    if not params:
        params = {}
    
    if not settings.TMDB_API_KEY:
        raise ValueError("TMDB_API_KEY is missing from environment variables.")
        
    params["api_key"] = settings.TMDB_API_KEY
    
    # Create a deterministic cache key based on endpoint and query params
    param_str = "-".join(f"{k}={v}" for k, v in sorted(params.items()) if k != "api_key")
    cache_key = f"tmdb:{endpoint}:{param_str}"
    
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    with httpx.Client(timeout=10.0) as client:
        response = client.get(f"{TMDB_BASE_URL}{endpoint}", params=params)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"TMDB API error: {response.text}"
            )
        
        data = response.json()
        set_cached_data(cache_key, data, expire_seconds=3600)
        return data


def search_movies(query: str) -> list:
    """Search for movies by title, or return 'now playing' if query is empty."""
    if not query:
        return fetch_tmdb("/movie/now_playing").get("results", [])
    return fetch_tmdb("/search/movie", {"query": query}).get("results", [])


def get_movie_details(movie_id: int) -> dict:
    """Fetch full details for a specific movie."""
    return fetch_tmdb(f"/movie/{movie_id}")
    # Add this below your existing search_movies function
def get_movie_details(movie_id: int):
    # Fetches detailed info for a specific TMDB movie ID
    return fetch_tmdb(f"/movie/{movie_id}")