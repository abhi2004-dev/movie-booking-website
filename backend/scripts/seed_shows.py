from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.entities import Movie, Show, ShowSeat, Seat

def seed_shows():
    db = SessionLocal()
    try:
        # 1. Create a dummy movie
        movie = db.query(Movie).first()
        if not movie:
            movie = Movie(title="Spider-Man: Brand New Day", tmdb_id=12345, duration_mins=120, language="English", genre="Action")
            db.add(movie)
            db.commit()

        # 2. Create a show for Screen 1 (Added base_price)
        show = db.query(Show).first()
        if not show:
            show = Show(
                movie_id=movie.id, 
                screen_id=1, 
                start_time=datetime.utcnow() + timedelta(days=1), 
                end_time=datetime.utcnow() + timedelta(days=1, hours=2), 
                base_price=150.0
            )
            db.add(show)
            db.commit()

        # 3. Map physical seats to this specific show
        if not db.query(ShowSeat).filter(ShowSeat.show_id == show.id).first():
            seats = db.query(Seat).filter(Seat.screen_id == 1).all()
            show_seats = [
                ShowSeat(show_id=show.id, seat_id=seat.id, price=150.0 if seat.seat_type == 'normal' else 250.0, status="available")
                for seat in seats
            ]
            db.add_all(show_seats)
            db.commit()
            print("Successfully seeded test show and available show_seats!")
        else:
            print("Shows already seeded.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_shows()