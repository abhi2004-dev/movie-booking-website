"""Database inspection script to view all saved records."""

from sqlalchemy.orm import joinedload
from app.db.session import SessionLocal
from app.models.entities import User, Movie, Theatre, Show, Booking, ShowSeat

def inspect_database():
    db = SessionLocal()
    try:
        print("=== USERS ===")
        users = db.query(User).all()
        if not users:
            print("No users found.")
        for u in users:
            print(f"ID: {u.id} | Name: {u.name} | Email: {u.email} | Created: {u.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("\n=== MOVIES ===")
        movies = db.query(Movie).all()
        if not movies:
            print("No movies found.")
        for m in movies:
            print(f"ID: {m.id} | Title: {m.title} | TMDB ID: {m.tmdb_id}")

        print("\n=== BOOKINGS ===")
        # Eagerly load the user relationship to get name and email without N+1 queries
        bookings = db.query(Booking).options(joinedload(Booking.user)).all()
        if not bookings:
            print("No bookings found.")
        for b in bookings:
            print(f"Booking ID: {b.id} | User: {b.user.name} ({b.user.email}) | Show ID: {b.show_id} | Amount: ₹{b.total_amount} | Status: {b.status}")
            
        print("\n=== HELD & BOOKED SEATS ===")
        seats = db.query(ShowSeat).filter(ShowSeat.status.in_(["held", "booked"])).all()
        if not seats:
            print("No seats currently held or booked.")
        for s in seats:
            print(f"Show ID: {s.show_id} | Seat ID: {s.seat_id} | Status: {s.status.upper()} | Price: ₹{s.price}")

    finally:
        db.close()

if __name__ == "__main__":
    print("Fetching database records...\n")
    inspect_database()
    print("\nDatabase inspection complete.")