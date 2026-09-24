"""Show seat layout, live hold concurrency, and reservation status routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.entities import ShowSeat, Seat, Show, Screen, Theatre, Movie
from app.schemas.show import ShowSeatsResponse, SeatHoldRequest, SeatHoldResponse
from app.services.locking import hold_seats, release_seats, is_seat_held, get_held_seat_ids

router = APIRouter(prefix="/shows", tags=["shows"])


@router.get("/{show_id}/seats", response_model=ShowSeatsResponse)
def get_show_seats(show_id: int, db: Session = Depends(get_db)):
    """Fetch seat layout, merging permanent Postgres state with temporary Redis/Memory holds."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    show_seats = (
        db.query(ShowSeat, Seat)
        .join(Seat, ShowSeat.seat_id == Seat.id)
        .filter(ShowSeat.show_id == show_id)
        .order_by(Seat.row_label, Seat.seat_number)
        .all()
    )

    if not show_seats:
        # Auto-create show_seats if missing for this show
        physical_seats = db.query(Seat).filter(Seat.screen_id == show.screen_id).all()
        if not physical_seats:
            # Seed physical seats if missing for this screen
            rows = ['A', 'B', 'C', 'D', 'E', 'F'] if (show.screen and show.screen.total_seats >= 50) else ['A', 'B', 'C', 'D']
            new_seats = []
            for r in rows:
                for num in range(1, 11):
                    st = 'recliner' if r == 'A' else 'premium' if r in ['B', 'C'] else 'normal'
                    new_seats.append(Seat(screen_id=show.screen_id, row_label=r, seat_number=num, seat_type=st))
            db.add_all(new_seats)
            db.commit()
            physical_seats = db.query(Seat).filter(Seat.screen_id == show.screen_id).all()

        base_price = float(show.base_price) if show.base_price else 150.0
        new_show_seats = []
        for seat in physical_seats:
            seat_price = base_price + 80.0 if seat.seat_type == "recliner" else base_price + 30.0 if seat.seat_type == "premium" else base_price
            new_show_seats.append(ShowSeat(
                show_id=show.id,
                seat_id=seat.id,
                price=seat_price,
                status="available"
            ))
        db.add_all(new_show_seats)
        db.commit()

        show_seats = (
            db.query(ShowSeat, Seat)
            .join(Seat, ShowSeat.seat_id == Seat.id)
            .filter(ShowSeat.show_id == show_id)
            .order_by(Seat.row_label, Seat.seat_number)
            .all()
        )

    if not show_seats:
        raise HTTPException(status_code=404, detail="No seats configured for this show")

    # Get all active hold IDs for this show
    held_ids = set(get_held_seat_ids(show_id))

    seats_response = []
    for show_seat, seat in show_seats:
        current_status = show_seat.status
        
        # If available in DB, check if temporarily held
        if current_status == "available" and show_seat.id in held_ids:
            current_status = "held"

        seats_response.append({
            "id": show_seat.id,
            "row_label": seat.row_label,
            "seat_number": seat.seat_number,
            "seat_type": seat.seat_type,
            "status": current_status,
            "price": float(show_seat.price)
        })

    return {
        "show_id": show_id,
        "movie_title": show.movie.title if show.movie else "Movie Show",
        "theatre_name": show.screen.theatre.name if show.screen and show.screen.theatre else "Starpass Cinema",
        "screen_name": show.screen.name if show.screen else "Screen 1",
        "show_time": show.start_time.strftime("%I:%M %p"),
        "show_date": show.start_time.strftime("%A, %b %d"),
        "seats": seats_response
    }


@router.post("/{show_id}/seats/hold", response_model=SeatHoldResponse)
def hold_seats_endpoint(show_id: int, request: SeatHoldRequest, db: Session = Depends(get_db)):
    """Attempt atomic multi-seat hold with 5-minute TTL lock (Redis/Memory)."""
    seat_ids = request.seat_ids
    if not seat_ids:
        raise HTTPException(status_code=400, detail="No seats specified.")

    # 1. Verify all seats exist for this show and are not booked in DB
    show_seats = db.query(ShowSeat).filter(
        ShowSeat.show_id == show_id,
        ShowSeat.id.in_(seat_ids)
    ).all()

    if len(show_seats) != len(seat_ids):
        raise HTTPException(status_code=404, detail="One or more seats were not found.")

    for s in show_seats:
        if s.status != "available":
            raise HTTPException(status_code=400, detail=f"Seat ID {s.id} is already permanently booked.")

    # 2. Acquire atomic hold
    acquired = hold_seats(show_id, user_id="guest_or_user", seat_ids=seat_ids)
    if not acquired:
        raise HTTPException(
            status_code=409,
            detail="One or more selected seats are currently locked by another user. Please choose different seats."
        )

    return {
        "success": True,
        "message": f"Successfully locked {len(seat_ids)} seat(s) for 5 minutes.",
        "held_seat_ids": seat_ids,
        "ttl_seconds": 300
    }


@router.post("/{show_id}/seats/release")
def release_seats_endpoint(show_id: int, request: SeatHoldRequest):
    """Release a temporary hold on specified seats."""
    release_seats(show_id, request.seat_ids)
    return {"message": "Seat holds released successfully", "seat_ids": request.seat_ids}


@router.post("/{show_id}/seats/{seat_id}/lock")
def lock_single_seat(show_id: int, seat_id: int, db: Session = Depends(get_db)):
    """Lock a single seat with 5-minute expiration."""
    show_seat = db.query(ShowSeat).filter(ShowSeat.id == seat_id, ShowSeat.show_id == show_id).first()
    if not show_seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    if show_seat.status != "available":
        raise HTTPException(status_code=400, detail="Seat is already booked")

    acquired = hold_seats(show_id, user_id="user_single", seat_ids=[seat_id])
    if not acquired:
        raise HTTPException(status_code=409, detail="Seat is currently locked by another user")

    return {"message": "Seat locked successfully"}


@router.post("/{show_id}/seats/{seat_id}/unlock")
def unlock_single_seat(show_id: int, seat_id: int):
    """Instantly release single seat hold."""
    release_seats(show_id, [seat_id])
    return {"message": "Seat unlocked successfully"}