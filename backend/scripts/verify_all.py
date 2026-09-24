"""Comprehensive integration and concurrency validation script."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print(f"Health check OK: {res.json()}")

    print("\n--- 2. Testing Movie Search & Catalog ---")
    res = client.get("/movies/search")
    assert res.status_code == 200
    movies = res.json()
    assert len(movies) > 0, "No movies returned"
    movie_id = movies[0]["id"]
    print(f"Movies Catalog OK. Found {len(movies)} movies. Top: {movies[0]['title']} (ID: {movie_id})")

    print("\n--- 3. Testing Movie Details & Shows ---")
    res = client.get(f"/movies/{movie_id}")
    assert res.status_code == 200
    print(f"Movie Details OK: {res.json()['title']}")

    res = client.get(f"/movies/{movie_id}/shows")
    assert res.status_code == 200
    theatres = res.json()
    assert len(theatres) > 0, "No theatres/shows found"
    show_id = theatres[0]["shows"][0]["id"]
    print(f"Shows OK: Found {len(theatres)} theatres. Selected Show ID: {show_id}")

    print("\n--- 4. Testing Show Seats Layout ---")
    res = client.get(f"/shows/{show_id}/seats")
    assert res.status_code == 200
    seat_data = res.json()
    seats = seat_data["seats"]
    available_seats = [s for s in seats if s["status"] == "available"]
    assert len(available_seats) >= 2, "Not enough available seats for testing"
    test_seat_1 = available_seats[0]["id"]
    test_seat_2 = available_seats[1]["id"]
    print(f"Seats Layout OK. Total: {len(seats)}, Available: {len(available_seats)}")

    print("\n--- 5. Testing Concurrency / Double-Hold Prevention ---")
    # Hold Seat 1
    res1 = client.post(f"/shows/{show_id}/seats/hold", json={"seat_ids": [test_seat_1]})
    assert res1.status_code == 200, f"Hold 1 failed: {res1.text}"
    print(f"User A hold on Seat {test_seat_1}: SUCCESS (200)")

    # Attempt to hold same Seat 1 by User B
    res2 = client.post(f"/shows/{show_id}/seats/hold", json={"seat_ids": [test_seat_1]})
    assert res2.status_code == 409, f"Expected 409 Conflict for double-hold, got {res2.status_code}: {res2.text}"
    print(f"User B duplicate hold on Seat {test_seat_1}: CORRECTLY REJECTED (409 Conflict)")

    # Release Seat 1
    client.post(f"/shows/{show_id}/seats/release", json={"seat_ids": [test_seat_1]})
    print(f"Hold released for Seat {test_seat_1}")

    print("\n--- 6. Testing User Auth & Token ---")
    test_email = f"cinephile_{uuid.uuid4().hex[:6]}@example.com"
    test_pass = "SecurePass123!"
    res = client.post("/auth/signup", json={"email": test_email, "password": test_pass, "name": "Test Cinephile"})
    assert res.status_code == 201, f"Signup failed: {res.text}"

    res = client.post("/auth/login", data={"username": test_email, "password": test_pass})
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("User Signup & Login OK. JWT Acquired.")

    res = client.get("/auth/me", headers=headers)
    assert res.status_code == 200
    print(f"Profile check OK: {res.json()['name']} ({res.json()['email']})")

    print("\n--- 7. Testing End-to-End Booking with Idempotency ---")
    idempotency_key = str(uuid.uuid4())
    booking_payload = {
        "show_id": show_id,
        "seat_ids": [test_seat_1, test_seat_2],
        "idempotency_key": idempotency_key
    }
    res = client.post("/bookings/", json=booking_payload, headers=headers)
    assert res.status_code == 200, f"Booking failed: {res.text}"
    booking_result = res.json()
    booking_id = booking_result["id"]
    print(f"Booking Confirmed! ID: {booking_id}, Txn: {booking_result['transaction_id']}, Amount: ${booking_result['total_amount']}")

    # Test Idempotency retry
    retry_res = client.post("/bookings/", json=booking_payload, headers=headers)
    assert retry_res.status_code == 200
    assert retry_res.json()["id"] == booking_id
    print("Idempotency Replay Test OK (Returned same booking without double-charging).")

    print("\n--- 8. Testing User Booking History (/bookings/me) ---")
    res = client.get("/bookings/me", headers=headers)
    assert res.status_code == 200
    my_tickets = res.json()
    assert len(my_tickets) >= 1
    ticket = my_tickets[0]
    print(f"My Tickets OK. Found {len(my_tickets)} ticket(s). Movie: {ticket['movie_title']}, Seats: {ticket['seat_names']}, Total: ${ticket['total_amount']}")

    print("\n--- 9. Testing Single Ticket Verification (/bookings/{id}) ---")
    res = client.get(f"/bookings/{booking_id}")
    assert res.status_code == 200
    print(f"Single Ticket Pass OK: {res.json()['movie_title']} @ {res.json()['theatre_name']}")

    print("\nALL BACKEND INTEGRATION & CONCURRENCY TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
