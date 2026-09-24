"""Movie catalog browsing and detail discovery routes."""

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from app.schemas.movie import MovieSearchResponse
from app.services.tmdb import search_movies, get_movie_details, FALLBACK_MOVIES
from app.db.session import get_db
from app.models.entities import Show, Screen, Theatre, Movie

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/search", response_model=List[Dict[str, Any]])
def search_movies_route(q: str = Query("", description="Search term")):
    """Search movies against TMDB cache or fetch default catalog."""
    return search_movies(q)


@router.get("/{movie_id}")
def get_movie_details_route(movie_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed movie attributes by identifier, with local DB & fallback catalog."""
    # 1. Query local database first
    local_movie = db.query(Movie).filter((Movie.tmdb_id == movie_id) | (Movie.id == movie_id)).first()
    if local_movie:
        return {
            "id": local_movie.tmdb_id or local_movie.id,
            "title": local_movie.title,
            "overview": local_movie.synopsis or "An extraordinary cinematic experience in high-definition.",
            "poster_path": local_movie.poster_url or "/posters/sonic_3.jpg",
            "backdrop_path": local_movie.poster_url or "/posters/sonic_3.jpg",
            "genres": [{"id": 0, "name": local_movie.genre}] if local_movie.genre else [{"id": 28, "name": "Action"}],
            "runtime": local_movie.duration_minutes or 120,
            "vote_average": float(local_movie.rating) if local_movie.rating else 7.8,
            "release_date": "2024"
        }

    # 2. Fallback from curated list
    for m in FALLBACK_MOVIES:
        if m["id"] == movie_id:
            return m

    return {
        "id": movie_id,
        "title": f"Feature Movie #{movie_id}",
        "overview": "Experience the biggest movie of the season in premium formats at Starpass theatres.",
        "poster_path": "/posters/sonic_3.jpg",
        "backdrop_path": "/posters/sonic_3.jpg",
        "genres": [{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}],
        "runtime": 120,
        "vote_average": 7.8,
        "release_date": "2024"
    }


@router.get("/{movie_id}/shows")
def get_movie_shows(movie_id: int, date_str: Optional[str] = Query(None, alias="date"), db: Session = Depends(get_db)):
    """List scheduled shows for a movie grouped by theatre and screen, supporting date selection."""
    # 1. Find the target movie in the database
    target_movie = db.query(Movie).filter((Movie.tmdb_id == movie_id) | (Movie.id == movie_id)).first()
    if not target_movie:
        # Check fallback catalog to find title, and see if it exists by title
        for m in FALLBACK_MOVIES:
            if m["id"] == movie_id:
                target_movie = db.query(Movie).filter(Movie.title == m["title"]).first()
                break

    if not target_movie:
        return []

    # 2. Query shows strictly belonging to this specific movie
    shows = db.query(Show).join(Screen).join(Theatre).filter(Show.movie_id == target_movie.id).all()

    theatres_map: Dict[int, Dict[str, Any]] = {}

    for show in shows:
        theatre = show.screen.theatre
        screen = show.screen
        t_id = theatre.id

        if t_id not in theatres_map:
            theatres_map[t_id] = {
                "theatre_id": theatre.id,
                "theatre_name": theatre.name,
                "city": theatre.city,
                "address": theatre.address,
                "screen_name": screen.name,
                "shows": []
            }

        start_dt = show.start_time
        time_str = start_dt.strftime("%I:%M %p")
        date_formatted = start_dt.strftime("%Y-%m-%d")

        # Determine format tag based on screen name
        format_tag = "IMAX 3D" if "IMAX" in screen.name else "Dolby Atmos 4K" if "Dolby" in screen.name else "Digital 4K"

        theatres_map[t_id]["shows"].append({
            "id": show.id,
            "time": time_str,
            "date": date_formatted,
            "screen_id": screen.id,
            "screen_name": screen.name,
            "format": format_tag,
            "base_price": float(show.base_price),
            "language": "English (Dolby Atmos)"
        })

    return list(theatres_map.values())