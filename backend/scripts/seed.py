"""Database seeder for theatres, screens, and default tiered seats."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.entities import Theatre, Screen, Seat

def seed_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Theatre).count() >= 3:
            print("Database already seeded with theatres.")
            return

        theatre1 = Theatre(name="Starpass Cinema City", city="New York", address="1540 Broadway, Times Square")
        theatre2 = Theatre(name="Starpass IMAX Luxe", city="San Francisco", address="845 Market St, Downtown")
        theatre3 = Theatre(name="Starpass Dolby Cinema", city="Los Angeles", address="6801 Hollywood Blvd")
        db.add_all([theatre1, theatre2, theatre3])
        db.commit()

        # Screens for Theatre 1
        s1_1 = Screen(theatre_id=theatre1.id, name="IMAX Grand Hall", total_seats=60)
        s1_2 = Screen(theatre_id=theatre1.id, name="Dolby Atmos Screen 2", total_seats=40)
        
        # Screens for Theatre 2
        s2_1 = Screen(theatre_id=theatre2.id, name="IMAX Laser Screen", total_seats=50)
        s2_2 = Screen(theatre_id=theatre2.id, name="VIP Lounge Screen", total_seats=30)
        
        # Screens for Theatre 3
        s3_1 = Screen(theatre_id=theatre3.id, name="Dolby Cinema 1", total_seats=50)
        
        db.add_all([s1_1, s1_2, s2_1, s2_2, s3_1])
        db.commit()

        # Seed tiered seats for each screen
        for screen in [s1_1, s1_2, s2_1, s2_2, s3_1]:
            seats = []
            rows = ['A', 'B', 'C', 'D', 'E', 'F'] if screen.total_seats >= 50 else ['A', 'B', 'C', 'D']
            seats_per_row = 10
            for row in rows:
                for num in range(1, seats_per_row + 1):
                    if row == 'A':
                        s_type = "recliner"  # VIP Recliner row
                    elif row in ['B', 'C']:
                        s_type = "premium"   # Club / Prime
                    else:
                        s_type = "normal"    # Standard
                    seats.append(Seat(screen_id=screen.id, row_label=row, seat_number=num, seat_type=s_type))
            db.add_all(seats)

        db.commit()
        print("Successfully seeded multiple theatres, screens, and tiered seats!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()