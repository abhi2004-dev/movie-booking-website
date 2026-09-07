"""Show seat map and locking routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import ShowSeat, Seat
from app.schemas.show import ShowSeatsResponse, SeatResponse, SeatHoldRequest
from app.services.locking import hold_seats, get_held_seat_ids

router = APIRouter(prefix="/shows", tags=["shows"])


@router.get("/{show_id}/seats", response_model=ShowSeatsResponse)
def get_show_seats(show_id: int, db: Session = Depends(get_db)):
    """Fetch seat layout map with live availability and held statuses."""
    show_seats = (
        db.query(ShowSeat, Seat)
        .join(Seat, ShowSeat.seat_id == Seat.id)
        .filter(ShowSeat.show_id == show_id)
        .all()
    )

    if not show_seats:
        raise HTTPException(status_code=404, detail="Show not found or has no seats mapped.")

    held_seat_ids = get_held_seat_ids(show_id)
    
    seats_data = []
    for show_seat, seat in show_seats:
        current_status = "held" if show_seat.seat_id in held_seat_ids and show_seat.status == "available" else show_seat.status
        
        seats_data.append({
            "id": seat.id,
            "row_label": seat.row_label,
            "seat_number": seat.seat_number,
            "seat_type": seat.seat_type,
            "status": current_status,
            "price": float(show_seat.price)
        })

    return {"show_id": show_id, "seats": seats_data}


@router.post("/{show_id}/seats/hold")
def hold_show_seats(show_id: int, request: SeatHoldRequest, db: Session = Depends(get_db)):
    """Acquire a temporary Redis-backed lock on selected show seats."""
    # Hardcoded user_id=1 for now until auth dependency is integrated into the endpoint
    user_id = 1 
    
    # Verify seats are actually available in Postgres first
    db_seats = db.query(ShowSeat).filter(
        ShowSeat.show_id == show_id,
        ShowSeat.seat_id.in_(request.seat_ids),
        ShowSeat.status == "available"
    ).all()
    
    if len(db_seats) != len(request.seat_ids):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="One or more selected seats are already booked."
        )

    success = hold_seats(show_id, user_id, request.seat_ids)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="One or more seats are currently being held by another user."
        )
        
    return {"message": "Seats successfully held.", "expires_in_seconds": 300}