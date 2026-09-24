import os
import time
import httpx
from typing import List, Dict, Any, Optional
from app.services.cache import get_cached_data, set_cached_data

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")

# Curated blockbuster movies with posters, backdrops, ratings, cast, and trailers for offline/fallback mode
FALLBACK_MOVIES = [
    {
        "id": 939243,
        "title": "Sonic the Hedgehog 3",
        "overview": "Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before.",
        "poster_path": "/posters/sonic_3.jpg",
        "backdrop_path": "/posters/sonic_3.jpg",
        "release_date": "2024-12-20",
        "vote_average": 7.8,
        "vote_count": 1820,
        "runtime": 110,
        "genres": [{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}, {"id": 878, "name": "Sci-Fi"}],
        "tagline": "Try to keep up.",
        "language": "English",
        "trailer_key": "qSu6i2iFMO0"
    },
    {
        "id": 533535,
        "title": "Deadpool & Wolverine",
        "overview": "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again.",
        "poster_path": "/posters/deadpool.jpg",
        "backdrop_path": "/posters/deadpool.jpg",
        "release_date": "2024-07-26",
        "vote_average": 8.1,
        "vote_count": 4200,
        "runtime": 128,
        "genres": [{"id": 28, "name": "Action"}, {"id": 35, "name": "Comedy"}, {"id": 878, "name": "Sci-Fi"}],
        "tagline": "Come together.",
        "language": "English",
        "trailer_key": "73_1biulkYk"
    },
    {
        "id": 693134,
        "title": "Dune: Part Two",
        "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
        "poster_path": "/posters/dune_2.jpg",
        "backdrop_path": "/posters/dune_2.jpg",
        "release_date": "2024-03-01",
        "vote_average": 8.5,
        "vote_count": 5600,
        "runtime": 166,
        "genres": [{"id": 878, "name": "Sci-Fi"}, {"id": 12, "name": "Adventure"}],
        "tagline": "Long live the fighters.",
        "language": "English",
        "trailer_key": "Way9Dexny3w"
    },
    {
        "id": 823464,
        "title": "Godzilla x Kong: The New Empire",
        "overview": "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence.",
        "poster_path": "/posters/godzilla_kong.jpg",
        "backdrop_path": "/posters/godzilla_kong.jpg",
        "release_date": "2024-03-29",
        "vote_average": 7.3,
        "vote_count": 3100,
        "runtime": 115,
        "genres": [{"id": 28, "name": "Action"}, {"id": 878, "name": "Sci-Fi"}, {"id": 12, "name": "Adventure"}],
        "tagline": "Rise together or fall alone.",
        "language": "English",
        "trailer_key": "lV1OOlGwExM"
    },
    {
        "id": 1022789,
        "title": "Inside Out 2",
        "overview": "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust face Anxiety and company.",
        "poster_path": "/posters/inside_out_2.jpg",
        "backdrop_path": "/posters/inside_out_2.jpg",
        "release_date": "2024-06-14",
        "vote_average": 7.9,
        "vote_count": 4800,
        "runtime": 96,
        "genres": [{"id": 16, "name": "Animation"}, {"id": 10751, "name": "Family"}, {"id": 35, "name": "Comedy"}],
        "tagline": "Make room for new emotions.",
        "language": "English",
        "trailer_key": "LEjhY15eCx0"
    },
    {
        "id": 762441,
        "title": "A Quiet Place: Day One",
        "overview": "As New York City is invaded by alien creatures with ultrasonic hearing, a woman named Sam must fight to survive alongside an unlikely companion and her cat Frodo.",
        "poster_path": "/posters/quiet_place.jpg",
        "backdrop_path": "/posters/quiet_place.jpg",
        "release_date": "2024-06-28",
        "vote_average": 7.1,
        "vote_count": 2200,
        "runtime": 99,
        "genres": [{"id": 27, "name": "Horror"}, {"id": 878, "name": "Sci-Fi"}, {"id": 53, "name": "Thriller"}],
        "tagline": "Hear how it all began.",
        "language": "English",
        "trailer_key": "YPY7J-flzE8"
    },
    {
        "id": 912649,
        "title": "Venom: The Last Dance",
        "overview": "Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on their final dance.",
        "poster_path": "/posters/venom_3.jpg",
        "backdrop_path": "/posters/venom_3.jpg",
        "release_date": "2024-10-25",
        "vote_average": 7.4,
        "vote_count": 2500,
        "runtime": 109,
        "genres": [{"id": 28, "name": "Action"}, {"id": 878, "name": "Sci-Fi"}],
        "tagline": "Till death do them part.",
        "language": "English",
        "trailer_key": "__2bjWbetsA"
    },
    {
        "id": 1184918,
        "title": "The Wild Robot",
        "overview": "After a shipwreck, an intelligent robot named Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
        "poster_path": "/posters/wild_robot.jpg",
        "backdrop_path": "/posters/wild_robot.jpg",
        "release_date": "2024-09-27",
        "vote_average": 8.4,
        "vote_count": 3400,
        "runtime": 102,
        "genres": [{"id": 16, "name": "Animation"}, {"id": 878, "name": "Sci-Fi"}, {"id": 10751, "name": "Family"}],
        "tagline": "Discover your true nature.",
        "language": "English",
        "trailer_key": "67vbA5ZJb3s"
    },
    {
        "id": 12345,
        "title": "Spider-Man: Brand New Day",
        "overview": "Peter Parker balances life in college with web-slinging across Manhattan, facing a formidable new rogue gallery in an all-new cinematic adventure.",
        "poster_path": "/posters/spiderman.jpg",
        "backdrop_path": "/posters/spiderman.jpg",
        "release_date": "2025-05-02",
        "vote_average": 8.6,
        "vote_count": 5100,
        "runtime": 142,
        "genres": [{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}, {"id": 878, "name": "Sci-Fi"}],
        "tagline": "A whole new web.",
        "language": "English",
        "trailer_key": "rt-2cxAiGoY"
    }
]


def fetch_tmdb(endpoint: str, params: dict = None) -> Optional[dict]:
    """Fetch data from TMDB API with cache checks, retries, and fallback support."""
    if not TMDB_API_KEY:
        return None

    cache_key = f"tmdb:{endpoint}:{sorted((params or {}).items())}"
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    if params is None:
        params = {}
    params["api_key"] = TMDB_API_KEY

    max_retries = 2
    with httpx.Client() as client:
        for attempt in range(max_retries):
            try:
                response = client.get(f"{TMDB_BASE_URL}{endpoint}", params=params, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    set_cached_data(cache_key, data, expire_seconds=3600)
                    return data
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"TMDB fetch attempt failed: {e}")
                time.sleep(0.5)

    return None


def search_movies(query: str = "") -> List[Dict[str, Any]]:
    """Search movies via TMDB or return curated catalog."""
    query = (query or "").strip().lower()

    if TMDB_API_KEY:
        if query:
            res = fetch_tmdb("/search/movie", {"query": query})
            if res and "results" in res and res["results"]:
                return res["results"]
        else:
            res = fetch_tmdb("/movie/now_playing")
            if res and "results" in res and res["results"]:
                return res["results"]

    # Curated fallback catalog
    if query:
        return [
            m for m in FALLBACK_MOVIES 
            if query in m["title"].lower() or any(query in g["name"].lower() for g in m.get("genres", []))
        ]
    return FALLBACK_MOVIES


def get_movie_details(movie_id: int) -> Optional[Dict[str, Any]]:
    """Get full movie details by TMDB ID with rich fallback."""
    if TMDB_API_KEY:
        data = fetch_tmdb(f"/movie/{movie_id}")
        if data and "title" in data:
            return data

    for m in FALLBACK_MOVIES:
        if m["id"] == movie_id:
            return m

    # Generic movie synthesis if matching ID not in static list
    return {
        "id": movie_id,
        "title": f"Feature Film #{movie_id}",
        "overview": "An extraordinary cinematic journey filled with thrills and dramatic spectacle.",
        "poster_path": "/d8duY2VPh1A0G6i5gJ9f0O49xG5.jpg",
        "backdrop_path": "/zOpe0eH7DL42z4qFm20h1Yt4rVp.jpg",
        "release_date": "2024",
        "vote_average": 7.5,
        "runtime": 120,
        "genres": [{"id": 28, "name": "Action"}, {"id": 12, "name": "Drama"}],
        "language": "English"
    }