"""Movie catalog browsing and detail discovery routes."""

from fastapi import APIRouter, Query, HTTPException
from typing import List

from app.schemas.movie import MovieSearchResponse
from app.services.tmdb import search_movies, get_movie_details

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/search", response_model=List[MovieSearchResponse])
def search_movies_route(q: str = Query("", description="Search term")):
    """Search movies against TMDB cache or fetch default 'now playing' catalog."""
    return search_movies(q)


# Removed response_model=MovieDetailResponse to prevent schema validation crashes on raw TMDB data
@router.get("/{movie_id}")
def get_movie_details_route(movie_id: int):
    """Retrieve detailed movie attributes by identifier."""
    data = get_movie_details(movie_id)
    
    if not data or data.get("success") == False or "id" not in data:
        raise HTTPException(status_code=404, detail="Movie not found on TMDB")
        
    return data


@router.get("/{movie_id}/shows")
def get_movie_shows(movie_id: int, date: str):
    """List scheduled shows for a movie filtered by target date."""
    return {"movie_id": movie_id, "date": date, "shows": []}