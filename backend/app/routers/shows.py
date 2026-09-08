from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import redis

from app.db.session import get_db
from app.models.entities import ShowSeat, Seat
from app.schemas.show import ShowSeatsResponse

router = APIRouter(prefix="/shows", tags=["shows"])

# Initialize Redis client targeting your local Docker container
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

@router.get("/{show_id}/seats", response_model=ShowSeatsResponse)
def get_show_seats(show_id: int, db: Session = Depends(get_db)):
    """Fetch seat layout, merging permanent Postgres state with temporary Redis locks."""
    
    show_seats = (
        db.query(ShowSeat, Seat)
        .join(Seat, ShowSeat.seat_id == Seat.id)
        .filter(ShowSeat.show_id == show_id)
        .all()
    )

    if not show_seats:
        raise HTTPException(status_code=404, detail="No seats found for this show")

    seats_response = []
    for show_seat, seat in show_seats:
        status = show_seat.status
        
        # If Postgres says the seat is available, we MUST check Redis to see if 
        # another user is currently holding it in their checkout session.
        if status == "available":
            is_held = redis_client.get(f"seat_lock:{show_id}:{show_seat.id}")
            if is_held:
                status = "held"

        seats_response.append({
            "id": show_seat.id,
            "row_label": seat.row_label,
            "seat_number": seat.seat_number,
            "seat_type": seat.seat_type,
            "status": status,
            "price": float(show_seat.price)
        })

    return {"show_id": show_id, "seats": seats_response}

@router.post("/{show_id}/seats/{seat_id}/lock")
def lock_seat(show_id: int, seat_id: int, db: Session = Depends(get_db)):
    """Instantly lock a seat in Redis with a 5-minute expiration."""
    
    # 1. Check Postgres to ensure someone hasn't already bought it permanently
    show_seat = db.query(ShowSeat).filter(ShowSeat.id == seat_id, ShowSeat.show_id == show_id).first()
    if not show_seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    if show_seat.status != "available":
        raise HTTPException(status_code=400, detail="Seat is already permanently booked")

    # 2. Redis SETNX (Set if Not eXists) with a 300 second (5 min) TTL
    lock_key = f"seat_lock:{show_id}:{seat_id}"
    acquired = redis_client.set(lock_key, "locked", ex=300, nx=True)
    
    if not acquired:
        raise HTTPException(status_code=400, detail="Seat is currently locked by another user")
        
    return {"message": "Seat locked successfully"}

@router.post("/{show_id}/seats/{seat_id}/unlock")
def unlock_seat(show_id: int, seat_id: int):
    """Instantly release the Redis lock if the user unselects the seat."""
    lock_key = f"seat_lock:{show_id}:{seat_id}"
    redis_client.delete(lock_key)
    return {"message": "Seat unlocked successfully"}