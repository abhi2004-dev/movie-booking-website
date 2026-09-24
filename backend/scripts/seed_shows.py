"""Seed movie shows and show_seat mappings for upcoming dates."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timedelta, timezone
from app.db.session import SessionLocal
from app.models.entities import Movie, Show, ShowSeat, Seat, Screen
from app.services.tmdb import FALLBACK_MOVIES

def seed_shows():
    db = SessionLocal()
    try:
        # 1. Seed Movies from curated catalog into Postgres if missing
        for m in FALLBACK_MOVIES:
            existing = db.query(Movie).filter(Movie.tmdb_id == m["id"]).first()
            if not existing:
                movie = Movie(
                    title=m["title"],
                    tmdb_id=m["id"],
                    duration_minutes=m.get("runtime", 120),
                    language=m.get("language", "English"),
                    genre=", ".join([g["name"] for g in m.get("genres", [])]),
                    rating=m.get("vote_average", 7.5),
                    poster_url=f"https://image.tmdb.org/t/p/w500{m['poster_path']}" if m.get("poster_path") else None,
                    synopsis=m.get("overview")
                )
                db.add(movie)
        db.commit()

        movies = db.query(Movie).all()
        screens = db.query(Screen).all()

        if not screens:
            print("No screens found. Run seed.py first.")
            return

        now = datetime.now(timezone.utc)
        show_times = [
            ("10:30 AM", 10, 30),
            ("01:45 PM", 13, 45),
            ("05:15 PM", 17, 15),
            ("08:30 PM", 20, 30),
            ("11:15 PM", 23, 15),
        ]

        # Seed shows for today, tomorrow, and the next 4 days
        shows_created = 0
        seats_created = 0

        for day_offset in range(0, 5):
            target_date = (now + timedelta(days=day_offset)).date()

            for screen_idx, screen in enumerate(screens):
                # Pick movie in round-robin fashion
                movie = movies[(screen_idx + day_offset) % len(movies)]
                physical_seats = db.query(Seat).filter(Seat.screen_id == screen.id).all()

                for label, hour, minute in show_times:
                    start_dt = datetime(target_date.year, target_date.month, target_date.day, hour, minute, tzinfo=timezone.utc)
                    end_dt = start_dt + timedelta(minutes=movie.duration_minutes or 120)

                    # Check if show already exists
                    existing_show = db.query(Show).filter(
                        Show.screen_id == screen.id,
                        Show.start_time == start_dt
                    ).first()

                    if not existing_show:
                        base_price = 250.0 if "IMAX" in screen.name else 200.0 if "Dolby" in screen.name else 150.0
                        show = Show(
                            movie_id=movie.id,
                            screen_id=screen.id,
                            start_time=start_dt,
                            end_time=end_dt,
                            base_price=base_price
                        )
                        db.add(show)
                        db.flush()
                        shows_created += 1

                        # Map all physical seats to this show
                        show_seats = []
                        for seat in physical_seats:
                            seat_price = base_price + 80.0 if seat.seat_type == "recliner" else base_price + 30.0 if seat.seat_type == "premium" else base_price
                            show_seats.append(ShowSeat(
                                show_id=show.id,
                                seat_id=seat.id,
                                price=seat_price,
                                status="available"
                            ))
                        db.add_all(show_seats)
                        seats_created += len(show_seats)

        db.commit()
        print(f"Successfully seeded {shows_created} shows and {seats_created} show_seats across {len(screens)} screens!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_shows()