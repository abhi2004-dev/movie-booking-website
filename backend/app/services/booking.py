import uuid
import redis
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.entities import Booking, BookingItem, Payment, ShowSeat

# Ensure this points to the same Redis instance as your shows router
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def process_transaction(db: Session, user_id: int, request):
    # 1. Idempotency Check (Prevent duplicate charges on network retries)
    existing_booking = db.query(Booking).filter(Booking.idempotency_key == request.idempotency_key).first()
    if existing_booking:
        return {
            "id": existing_booking.id, 
            "status": existing_booking.status, 
            "total_amount": float(existing_booking.total_amount), 
            "transaction_id": "txn_recovered"
        }

    # 2. Database Row-Level Lock (FOR UPDATE)
    # We query by ShowSeat.id (not seat_id) because the frontend maps directly to ShowSeat.id
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

    # 3. Execute Transaction
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
        seat.status = "booked"  # Permanent database lock
        db.add(BookingItem(booking_id=booking.id, show_seat_id=seat.id, price=seat.price))

    payment = Payment(booking_id=booking.id, amount=total_amount, status="successful")
    db.add(payment)
    
    db.commit()

    # 4. Release Temporary Redis Holds
    # Key must exactly match the format in backend/app/routers/shows.py
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