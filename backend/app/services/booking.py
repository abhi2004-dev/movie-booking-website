import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.entities import Booking, BookingItem, Payment, ShowSeat
from app.services.locking import get_seat_lock_key, redis_client

def process_transaction(db: Session, user_id: int, request):
    # 1. Idempotency Check
    existing_booking = db.query(Booking).filter(Booking.idempotency_key == request.idempotency_key).first()
    if existing_booking:
        return {
            "id": existing_booking.id, 
            "status": existing_booking.status, 
            "total_amount": float(existing_booking.total_amount), 
            "transaction_id": "txn_recovered"
        }

    # 2. Database Row-Level Lock (FOR UPDATE)
    show_seats = db.query(ShowSeat).filter(
        ShowSeat.show_id == request.show_id,
        ShowSeat.seat_id.in_(request.seat_ids),
        ShowSeat.status == "available"
    ).with_for_update().all()

    if len(show_seats) != len(request.seat_ids):
        db.rollback()
        raise HTTPException(status_code=400, detail="Seats expired or already booked.")

    # 3. Execute Transaction
    total_amount = sum(seat.price for seat in show_seats)
    generated_txn_id = f"txn_{uuid.uuid4().hex[:12]}"
    
    booking = Booking(user_id=user_id, show_id=request.show_id, total_amount=total_amount, status="confirmed", idempotency_key=request.idempotency_key)
    db.add(booking)
    db.flush()

    for seat in show_seats:
        seat.status = "booked"
        db.add(BookingItem(booking_id=booking.id, show_seat_id=seat.id, price=seat.price))

    # Removed transaction_id to match the database schema
    payment = Payment(booking_id=booking.id, amount=total_amount, status="successful")
    db.add(payment)
    
    db.commit()

    # 4. Release Redis Holds
    pipeline = redis_client.pipeline()
    for seat_id in request.seat_ids:
        pipeline.delete(get_seat_lock_key(request.show_id, seat_id))
    pipeline.execute()

    return {
        "id": booking.id, 
        "status": booking.status, 
        "total_amount": float(total_amount), 
        "transaction_id": generated_txn_id
    }