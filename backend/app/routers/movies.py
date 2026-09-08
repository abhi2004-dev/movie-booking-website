"""Movie catalog browsing and detail discovery routes."""

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.movie import MovieSearchResponse
from app.services.tmdb import search_movies, get_movie_details
from app.db.session import get_db
from app.models.entities import Show, Screen, Theatre, Movie

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/search", response_model=List[MovieSearchResponse])
def search_movies_route(q: str = Query("", description="Search term")):
    """Search movies against TMDB cache or fetch default 'now playing' catalog."""
    return search_movies(q)


@router.get("/{movie_id}")
def get_movie_details_route(movie_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed movie attributes by identifier, with local DB fallback."""
    try:
        data = get_movie_details(movie_id)
        if not data or data.get("success") == False or "id" not in data:
            raise ValueError("Invalid TMDB response")
        return data
    except Exception as e:
        print(f"TMDB Connection Blocked: {e}. Falling back to local PostgreSQL database.")
        
        # Query our local PostgreSQL database for the movie details
        local_movie = db.query(Movie).filter(Movie.tmdb_id == movie_id).first()
        
        if local_movie:
            return {
                "id": local_movie.tmdb_id,
                "title": local_movie.title,
                "overview": local_movie.synopsis or "No synopsis available (Offline Mode).",
                "poster_path": local_movie.poster_url,
                "genres": [{"id": 0, "name": local_movie.genre}] if local_movie.genre else [],
                "runtime": local_movie.duration_minutes or 120,
                "vote_average": float(local_movie.rating) if local_movie.rating else 0.0,
                "release_date": "N/A"
            }
            
        # If it fails TMDB and isn't in our local DB, return a generic placeholder
        return {
            "id": movie_id,
            "title": f"Unknown Movie (ID: {movie_id})",
            "overview": "TMDB is currently unreachable and this movie is not cached in the local database. Proceed to booking to test the seat map.",
            "poster_path": None,
            "genres": [],
            "runtime": 120,
            "vote_average": 0.0,
            "release_date": "N/A"
        }


@router.get("/{movie_id}/shows")
def get_movie_shows(movie_id: int, date: Optional[str] = None, db: Session = Depends(get_db)):
    """List scheduled shows for a movie, grouping them by theatre and screen."""
    
    # Temporarily dropping the movie_id filter so you can test seating with any movie
    shows = (
        db.query(Show)
        .join(Screen)
        .join(Theatre)
        .all()
    )
    
    theatres_map = {}
    for show in shows:
        t_id = show.screen.theatre.id
        if t_id not in theatres_map:
            theatres_map[t_id] = {
                "theatre_name": show.screen.theatre.name,
                "screen_name": show.screen.name,
                "shows": []
            }
        
        time_str = show.start_time.strftime("%I:%M %p")
        
        theatres_map[t_id]["shows"].append({
            "id": show.id,
            "time": time_str,
            "language": "English"
        })
        
    return list(theatres_map.values())