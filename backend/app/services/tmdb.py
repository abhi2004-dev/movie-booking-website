import os
import time
import httpx
from fastapi import HTTPException
from app.services.cache import get_cached_data, set_cached_data

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

def fetch_tmdb(endpoint: str, params: dict = None):
    # 1. Check Redis Cache First
    cache_key = f"tmdb:{endpoint}"
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    # 2. Prepare API Request
    if params is None:
        params = {}
    params["api_key"] = TMDB_API_KEY
    
    max_retries = 3
    with httpx.Client() as client:
        for attempt in range(max_retries):
            try:
                response = client.get(f"{TMDB_BASE_URL}{endpoint}", params=params, timeout=10.0)
                response.raise_for_status()
                
                data = response.json()
                # Cache the successful response for 1 hour
                set_cached_data(cache_key, data, expire=3600) 
                return data
                
            except (httpx.ConnectError, httpx.ReadTimeout, httpx.HTTPError) as e:
                if attempt == max_retries - 1:
                    print(f"TMDB fetch failed after {max_retries} attempts: {e}")
                    raise HTTPException(status_code=502, detail="Failed to connect to external movie provider.")
                time.sleep(1) # Wait 1 second before retrying

def search_movies(query: str = None):
    return fetch_tmdb("/movie/now_playing").get("results", [])

def get_movie_details(movie_id: int):
    return fetch_tmdb(f"/movie/{movie_id}")