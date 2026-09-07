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