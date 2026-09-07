"""Database seeder for theatres, screens, and default seats."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.entities import Theatre, Screen, Seat

def seed_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Theatre).first():
            print("Database already seeded with theatres.")
            return

        theatre1 = Theatre(name="Starpass Metro", city="New York", address="123 Broadway")
        theatre2 = Theatre(name="Starpass IMAX", city="San Francisco", address="456 Market St")
        db.add_all([theatre1, theatre2])
        db.commit()

        screen1 = Screen(theatre_id=theatre1.id, name="Screen 1", total_seats=30)
        screen2 = Screen(theatre_id=theatre2.id, name="IMAX Screen", total_seats=50)
        db.add_all([screen1, screen2])
        db.commit()

        seats = []
        # Seed 3 rows of 10 seats for screen 1
        for row in ['A', 'B', 'C']:
            for num in range(1, 11):
                s_type = "premium" if row == 'C' else "normal"
                seats.append(Seat(screen_id=screen1.id, row_label=row, seat_number=num, seat_type=s_type))
        
        db.add_all(seats)
        db.commit()
        print("Successfully seeded theatres, screens, and seats!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()