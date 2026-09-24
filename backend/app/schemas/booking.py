from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class BookingRequest(BaseModel):
    show_id: int
    seat_ids: List[int]
    idempotency_key: str = Field(..., description="Unique UUID to prevent duplicate charges")
    
class BookingResponse(BaseModel):
    id: int
    status: str
    total_amount: float
    transaction_id: str

class SeatDetail(BaseModel):
    row_label: str
    seat_number: int

class BookingHistoryItem(BaseModel):
    id: int
    movie_title: str
    theatre_name: str
    screen_name: str
    show_time: datetime
    total_amount: float
    status: str
    seats: List[SeatDetail]
    created_at: datetime