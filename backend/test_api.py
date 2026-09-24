import urllib.request
import json

BASE = "http://127.0.0.1:8000"

def test_api():
    print("Testing /health...")
    with urllib.request.urlopen(f"{BASE}/health") as r:
        print("  /health status:", r.status, json.loads(r.read().decode()))

    print("\nTesting /movies/search...")
    with urllib.request.urlopen(f"{BASE}/movies/search") as r:
        movies = json.loads(r.read().decode())
        print(f"  Found {len(movies)} movies.")

    print("\nTesting /movies/1 and /movies/1/shows...")
    with urllib.request.urlopen(f"{BASE}/movies/1") as r:
        movie = json.loads(r.read().decode())
        print(f"  Movie 1: {movie.get('title')}")
    with urllib.request.urlopen(f"{BASE}/movies/1/shows") as r:
        theatre_groups = json.loads(r.read().decode())
        print(f"  Found {len(theatre_groups)} theatre groups for Movie 1.")
        first_show = theatre_groups[0]["shows"][0]
        show_id = first_show["id"]
        print(f"  Selected Show ID {show_id} at {first_show['time']}")

    print(f"\nTesting /shows/{show_id}/seats...")
    with urllib.request.urlopen(f"{BASE}/shows/{show_id}/seats") as r:
        seat_data = json.loads(r.read().decode())
        seats = seat_data.get("seats", [])
        print(f"  Show {show_id} has {len(seats)} seats in screen {seat_data.get('screen_name')}.")

    print("\nTesting all theatre shows seat mapping (checking for any 404s)...")
    for group in theatre_groups:
        for show in group.get("shows", []):
            sid = show["id"]
            with urllib.request.urlopen(f"{BASE}/shows/{sid}/seats") as r:
                s_data = json.loads(r.read().decode())
                print(f"  Show {sid} ({group['theatre_name']} - {s_data.get('screen_name')}): {len(s_data.get('seats', []))} seats - OK")

    print("\nAll tested endpoints at http://127.0.0.1:8000 are functioning perfectly!")

if __name__ == "__main__":
    test_api()
