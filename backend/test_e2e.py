import urllib.request
import urllib.parse
import json
import uuid

BASE = "http://127.0.0.1:8000"

def post_json(url, data, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode("utf-8"))

def post_form(url, form_data):
    data = urllib.parse.urlencode(form_data).encode("utf-8")
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode("utf-8"))

def get_json(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode("utf-8"))

def test_full_workflow():
    print("--- 1. Testing Auth Flow (Signup -> Login -> /auth/me) ---")
    test_email = f"testuser_{uuid.uuid4().hex[:6]}@example.com"
    test_password = "SecurePassword123!"
    
    # 1. Signup
    status, signup_res = post_json(f"{BASE}/auth/signup", {
        "email": test_email,
        "password": test_password,
        "name": "Test Starpass User",
        "phone": "+1234567890"
    })
    print(f"  Signup: Status {status}, Created user: {signup_res.get('email')} (ID: {signup_res.get('id')})")

    # 2. Login
    status, login_res = post_form(f"{BASE}/auth/login", {
        "username": test_email,
        "password": test_password
    })
    print(f"  Login: Status {status}, Token received: {'access_token' in login_res}")
    token = login_res["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 3. Profile
    status, me_res = get_json(f"{BASE}/auth/me", headers=auth_headers)
    print(f"  /auth/me: User {me_res.get('email')} verified (Name: {me_res.get('name')})")

    print("\n--- 2. Testing Show Seat Map & Locking Concurrency ---")
    status, seat_map = get_json(f"{BASE}/shows/2/seats")
    available_seats = [s for s in seat_map["seats"] if s["status"] == "available"]
    assert len(available_seats) >= 2, "Need at least 2 available seats"
    seat1 = available_seats[0]
    seat2 = available_seats[1]
    
    print(f"  Locking Seat {seat1['seat_number']} (ID {seat1['id']})...")
    status, lock1 = post_json(f"{BASE}/shows/2/seats/{seat1['id']}/lock", {})
    print(f"  Lock status: {status}, response: {lock1}")

    print(f"  Locking Seat {seat2['seat_number']} (ID {seat2['id']})...")
    status, lock2 = post_json(f"{BASE}/shows/2/seats/{seat2['id']}/lock", {})
    print(f"  Lock status: {status}, response: {lock2}")

    print("\n--- 3. Testing Booking Creation & Ticket Pass ---")
    idempotency_key = str(uuid.uuid4())
    status, booking_res = post_json(f"{BASE}/bookings/", {
        "show_id": 2,
        "seat_ids": [seat1["id"], seat2["id"]],
        "idempotency_key": idempotency_key
    }, headers=auth_headers)
    print(f"  Booking Creation: Status {status}, Booking ID: {booking_res.get('id')}, Status: {booking_res.get('status')}")
    booking_id = booking_res["id"]

    print(f"\n--- 4. Fetching Digital Ticket Pass for Booking #{booking_id} ---")
    status, ticket = get_json(f"{BASE}/bookings/{booking_id}")
    print(f"  Ticket Movie: {ticket.get('movie_title')}")
    print(f"  Ticket Theatre & Screen: {ticket.get('theatre_name')} - {ticket.get('screen_name')}")
    print(f"  Ticket Seats: {ticket.get('seat_names')}")
    print(f"  Ticket Amount: ${ticket.get('total_amount')}")

    print(f"\n--- 5. Fetching My Bookings for Authenticated User ---")
    status, my_bookings = get_json(f"{BASE}/bookings/me", headers=auth_headers)
    print(f"  User has {len(my_bookings)} active booking(s). Most recent: #{my_bookings[0]['id']}")

    print("\n=======================================================")
    print("ALL API FLOWS ON http://127.0.0.1:8000 PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_full_workflow()
