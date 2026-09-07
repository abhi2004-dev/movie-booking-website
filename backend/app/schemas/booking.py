from pydantic import BaseModel, Field
from typing import List

class BookingRequest(BaseModel):
    show_id: int
    seat_ids: List[int]
    idempotency_key: str = Field(..., description="Unique UUID to prevent duplicate charges")
    
class BookingResponse(BaseModel):
    id: int
    status: str
    total_amount: float
    transaction_id: str