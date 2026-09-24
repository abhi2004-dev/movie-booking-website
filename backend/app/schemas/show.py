"""Pydantic schemas for show seating and reservations."""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SeatResponse(BaseModel):
    id: int
    row_label: str
    seat_number: int
    seat_type: str
    status: str
    price: float


class ShowSeatsResponse(BaseModel):
    show_id: int
    movie_title: Optional[str] = None
    theatre_name: Optional[str] = None
    screen_name: Optional[str] = None
    show_time: Optional[str] = None
    show_date: Optional[str] = None
    seats: List[SeatResponse]


class SeatHoldRequest(BaseModel):
    seat_ids: List[int]


class SeatHoldResponse(BaseModel):
    success: bool
    message: str
    held_seat_ids: List[int] = []
    ttl_seconds: int = 300