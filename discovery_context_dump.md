# Discovery Flow Context Dump

This document aggregates the full, exact contents of the backend and frontend files relevant to the **Discovery Flow** (`Movie Details` -> `Show Selection`), along with notes regarding existing routes and file structures.

---

## backend/app/routers/movies.py

```python
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
```

---

## backend/app/schemas/movie.py

```python
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
```

---

## backend/app/schemas/show.py

```python
"""Pydantic schemas for show seating and reservations."""

from pydantic import BaseModel
from typing import List


class SeatResponse(BaseModel):
    id: int
    row_label: str
    seat_number: int
    seat_type: str
    status: str
    price: float


class ShowSeatsResponse(BaseModel):
    show_id: int
    seats: List[SeatResponse]


class SeatHoldRequest(BaseModel):
    seat_ids: List[int]
```

---

## backend/app/models/entities.py

```python
"""PostgreSQL relational entities and indexes for the Starpass platform."""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    """Return timezone-aware current UTC time."""
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="user")


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tmdb_id: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    genre: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    language: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Numeric(3, 1), nullable=True)
    poster_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    synopsis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cached_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    shows: Mapped[List["Show"]] = relationship("Show", back_populates="movie")


class Theatre(Base):
    __tablename__ = "theatres"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(500), nullable=False)

    screens: Mapped[List["Screen"]] = relationship("Screen", back_populates="theatre", cascade="all, delete-orphan")


class Screen(Base):
    __tablename__ = "screens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    theatre_id: Mapped[int] = mapped_column(Integer, ForeignKey("theatres.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    total_seats: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    theatre: Mapped["Theatre"] = relationship("Theatre", back_populates="screens")
    seats: Mapped[List["Seat"]] = relationship("Seat", back_populates="screen", cascade="all, delete-orphan")
    shows: Mapped[List["Show"]] = relationship("Show", back_populates="screen")


class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    screen_id: Mapped[int] = mapped_column(Integer, ForeignKey("screens.id", ondelete="CASCADE"), nullable=False)
    row_label: Mapped[str] = mapped_column(String(10), nullable=False)
    seat_number: Mapped[int] = mapped_column(Integer, nullable=False)
    seat_type: Mapped[str] = mapped_column(String(50), default="normal", nullable=False)

    screen: Mapped["Screen"] = relationship("Screen", back_populates="seats")
    show_seats: Mapped[List["ShowSeat"]] = relationship("ShowSeat", back_populates="seat")

    __table_args__ = (
        UniqueConstraint("screen_id", "row_label", "seat_number", name="uq_screen_seat_position"),
    )


class Show(Base):
    __tablename__ = "shows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    movie_id: Mapped[int] = mapped_column(Integer, ForeignKey("movies.id", ondelete="RESTRICT"), nullable=False)
    screen_id: Mapped[int] = mapped_column(Integer, ForeignKey("screens.id", ondelete="RESTRICT"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    base_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    movie: Mapped["Movie"] = relationship("Movie", back_populates="shows")
    screen: Mapped["Screen"] = relationship("Screen", back_populates="shows")
    show_seats: Mapped[List["ShowSeat"]] = relationship("ShowSeat", back_populates="show", cascade="all, delete-orphan")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="show")

    __table_args__ = (
        Index("idx_shows_movie_start_time", "movie_id", "start_time"),
    )


class ShowSeat(Base):
    __tablename__ = "show_seats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    show_id: Mapped[int] = mapped_column(Integer, ForeignKey("shows.id", ondelete="RESTRICT"), nullable=False)
    seat_id: Mapped[int] = mapped_column(Integer, ForeignKey("seats.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="available", nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    show: Mapped["Show"] = relationship("Show", back_populates="show_seats")
    seat: Mapped["Seat"] = relationship("Seat", back_populates="show_seats")
    booking_items: Mapped[List["BookingItem"]] = relationship("BookingItem", back_populates="show_seat")

    __table_args__ = (
        UniqueConstraint("show_id", "seat_id", name="uq_show_seat_single_status"),
        Index("idx_show_seats_show_status", "show_id", "status"),
    )


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    show_id: Mapped[int] = mapped_column(Integer, ForeignKey("shows.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="bookings")
    show: Mapped["Show"] = relationship("Show", back_populates="bookings")
    booking_items: Mapped[List["BookingItem"]] = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")


class BookingItem(Base):
    __tablename__ = "booking_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(Integer, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False)
    show_seat_id: Mapped[int] = mapped_column(Integer, ForeignKey("show_seats.id", ondelete="RESTRICT"), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="booking_items")
    show_seat: Mapped["ShowSeat"] = relationship("ShowSeat", back_populates="booking_items")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(Integer, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    provider_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payments")
```

---

## frontend/app/movies/[id]/page.tsx

> **Note on Current Frontend File Layout:**
> `frontend/app/movies/[id]/page.tsx` currently contains the `ShowsSelection` component (hardcoded to show mock Starpass Multiplex shows for show ID 2 and linking to `/shows/${show.id}`).
> Meanwhile, `frontend/app/shows/[id]/page.tsx` contains the `MovieDetails` component (fetching `/movies/${id}` from the backend and linking to `/movies/${id}/shows`).

```tsx
import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

// Simulating fetching shows for a specific movie from the backend
async function getMovieShows(movieId: string) {
  // In a full implementation, you would fetch from: /movies/${movieId}/shows
  // For the MVP, we are hardcoding the successful seed data (Show ID 2)
  return [
    {
      theatre_name: "Starpass Multiplex",
      screen_name: "Screen 1",
      shows: [
        { id: 2, time: "06:00 PM", language: "English" },
      ]
    }
  ];
}

export default async function ShowsSelection({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const theatres = await getMovieShows(resolvedParams.id);

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <TextReveal text="Select Theatre & Show" className="text-3xl font-bold text-primary mb-8 text-center" />
      
      <div className="flex flex-col gap-6">
        {theatres.map((theatre, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-primary mb-1">{theatre.theatre_name}</h2>
            <p className="text-sm text-secondary mb-4">{theatre.screen_name}</p>
            
            <div className="flex flex-wrap gap-4">
              {theatre.shows.map(show => (
                <Link 
                  key={show.id} 
                  href={`/shows/${show.id}`}
                  className="px-6 py-2 border-2 border-accent text-accent rounded-md font-medium hover:bg-accent hover:text-white transition-colors"
                >
                  {show.time}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## frontend/app/shows/[id]/page.tsx

> **Note:** This is the current Movie Details page implementation located at `/shows/[id]/page.tsx`.

```tsx
import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

async function getMovieDetails(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/movies/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

export default async function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  return (
    <div className="py-12 max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title} 
          className="w-full md:w-1/3 rounded-xl shadow-lg"
        />
        <div className="flex flex-col justify-center">
          <TextReveal text={movie.title} className="text-4xl font-bold text-primary mb-4" />
          <p className="text-secondary text-lg mb-6">{movie.overview}</p>
          <div className="flex gap-4 mb-8">
            <span className="px-3 py-1 bg-gray-100 text-sm font-medium rounded-full">⭐ {movie.vote_average}/10</span>
            <span className="px-3 py-1 bg-gray-100 text-sm font-medium rounded-full">{movie.release_date}</span>
          </div>
          <Link 
            href={`/movies/${resolvedParams.id}/shows`}
            className="w-fit px-8 py-3 bg-accent text-white rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## frontend/app/movies/[id]/shows/page.tsx

> **Note:** The directory `frontend/app/movies/[id]/shows/` exists but currently contains no file (empty directory). The shows selection UI was placed in `frontend/app/movies/[id]/page.tsx`, while the movie detail UI was placed in `frontend/app/shows/[id]/page.tsx`.
