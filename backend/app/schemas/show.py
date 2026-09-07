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