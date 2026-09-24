import uuid
import redis
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from app.models.entities import Booking, BookingItem, Payment, ShowSeat, Show, Screen, Theatre

from app.core.config import settings

# Ensure this points to the configured Redis instance
redis_client = redis.Redis(
    host="127.0.0.1" if settings.REDIS_HOST == "localhost" else settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True
)

def process_transaction(db: Session, user_id: int, request):
    existing_booking = db.query(Booking).filter(Booking.idempotency_key == request.idempotency_key).first()
    if existing_booking:
        return {
            "id": existing_booking.id, 
            "status": existing_booking.status, 
            "total_amount": float(existing_booking.total_amount), 
            "transaction_id": "txn_recovered"
        }

    show_seats = db.query(ShowSeat).filter(
        ShowSeat.show_id == request.show_id,
        ShowSeat.id.in_(request.seat_ids)
    ).with_for_update().all()

    if len(show_seats) != len(request.seat_ids):
        db.rollback()
        raise HTTPException(status_code=400, detail="One or more seats could not be found.")

    for seat in show_seats:
        if seat.status == "booked":
            db.rollback()
            raise HTTPException(status_code=400, detail="One of the selected seats is already permanently booked.")

    total_amount = sum(seat.price for seat in show_seats)
    generated_txn_id = f"txn_{uuid.uuid4().hex[:12]}"
    
    booking = Booking(
        user_id=user_id, 
        show_id=request.show_id, 
        total_amount=total_amount, 
        status="confirmed", 
        idempotency_key=request.idempotency_key
    )
    db.add(booking)
    db.flush()

    for seat in show_seats:
        seat.status = "booked" 
        db.add(BookingItem(booking_id=booking.id, show_seat_id=seat.id, price=seat.price))

    payment = Payment(booking_id=booking.id, amount=total_amount, status="successful")
    db.add(payment)
    
    db.commit()

    pipeline = redis_client.pipeline()
    for seat_id in request.seat_ids:
        pipeline.delete(f"seat_lock:{request.show_id}:{seat_id}")
    pipeline.execute()

    return {
        "id": booking.id, 
        "status": booking.status, 
        "total_amount": float(total_amount), 
        "transaction_id": generated_txn_id
    }

def get_user_bookings(db: Session, user_id: int):
    bookings = db.query(Booking).options(
        joinedload(Booking.show).joinedload(Show.movie),
        joinedload(Booking.show).joinedload(Show.screen).joinedload(Screen.theatre),
        joinedload(Booking.booking_items).joinedload(BookingItem.show_seat).joinedload(ShowSeat.seat)
    ).filter(Booking.user_id == user_id).order_by(Booking.created_at.desc()).all()

    result = []
    for b in bookings:
        seats = [{"row_label": item.show_seat.seat.row_label, "seat_number": item.show_seat.seat.seat_number} for item in b.booking_items]
        result.append({
            "id": b.id,
            "movie_title": b.show.movie.title,
            "theatre_name": b.show.screen.theatre.name,
            "screen_name": b.show.screen.name,
            "show_time": b.show.start_time,
            "total_amount": float(b.total_amount),
            "status": b.status,
            "seats": seats,
            "created_at": b.created_at
        })
    return result