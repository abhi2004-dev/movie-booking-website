from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.booking import BookingRequest, BookingResponse, BookingHistoryItem
from app.services.booking import process_transaction, get_user_bookings
from app.core.security import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=BookingResponse)
def create_booking(
    request: BookingRequest, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user)
):
    """Confirm a booking. Protected by JWT."""
    return process_transaction(db, user_id, request)

@router.get("/me", response_model=List[BookingHistoryItem])
def get_my_bookings(
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user)
):
    """Retrieve booking history for the logged-in user."""
    return get_user_bookings(db, user_id)