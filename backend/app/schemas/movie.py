"""Pydantic schemas for movie catalog responses."""

from pydantic import BaseModel
from typing import List, Optional


class MovieSearchResponse(BaseModel):
    id: int
    title: str
    poster_path: Optional[str] = None
    release_date: Optional[str] = None


class MovieGenre(BaseModel):
    id: int
    name: str


class MovieDetailResponse(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    genres: List[MovieGenre] = []
    runtime: Optional[int] = None
    vote_average: Optional[float] = None