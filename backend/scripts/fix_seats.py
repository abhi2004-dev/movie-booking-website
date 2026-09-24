import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.entities import Screen, Seat, Show, ShowSeat

def fix():
    db = SessionLocal()
    try:
        # 1. Fill physical seats for any screen missing them
        for screen in db.query(Screen).all():
            cnt = db.query(Seat).filter(Seat.screen_id == screen.id).count()
            if cnt == 0:
                seats = []
                rows = ['A', 'B', 'C', 'D', 'E', 'F'] if screen.total_seats >= 50 else ['A', 'B', 'C', 'D']
                for r in rows:
                    for num in range(1, 11):
                        st = 'recliner' if r == 'A' else 'premium' if r in ['B', 'C'] else 'normal'
                        seats.append(Seat(screen_id=screen.id, row_label=r, seat_number=num, seat_type=st))
                db.add_all(seats)
                print(f"Added {len(seats)} physical seats for Screen {screen.id} ({screen.name})")
        db.commit()

        # 2. Fill show_seats for any show missing them
        fixed_shows = 0
        for show in db.query(Show).all():
            show_seats_cnt = db.query(ShowSeat).filter(ShowSeat.show_id == show.id).count()
            if show_seats_cnt == 0:
                seats = db.query(Seat).filter(Seat.screen_id == show.screen_id).all()
                base_price = float(show.base_price) if show.base_price else 150.0
                new_items = []
                for s in seats:
                    seat_price = base_price + 80.0 if s.seat_type == 'recliner' else base_price + 30.0 if s.seat_type == 'premium' else base_price
                    new_items.append(ShowSeat(show_id=show.id, seat_id=s.id, price=seat_price, status='available'))
                db.add_all(new_items)
                fixed_shows += 1
        db.commit()
        print(f"Fixed {fixed_shows} shows with missing show_seats.")
    finally:
        db.close()

if __name__ == "__main__":
    fix()
