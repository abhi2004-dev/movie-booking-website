import httpx

c = httpx.Client(base_url='http://localhost:3000', timeout=10.0)

print('=== 1. Checking Static Posters ===')
for name in ['sonic_3.jpg', 'dune_2.jpg', 'deadpool.jpg', 'spiderman.jpg', 'godzilla_kong.jpg', 'inside_out_2.jpg', 'quiet_place.jpg', 'venom_3.jpg', 'wild_robot.jpg']:
    r = c.get(f'/posters/{name}')
    print(f'Poster {name}: status {r.status_code}, length {len(r.content)}')

print('\n=== 2. Checking Movies API ===')
movies = c.get('/api/backend/movies').json()
for m in movies:
    print(f"Movie: ID={m.get('id')}, TMDB={m.get('tmdb_id')}, Title={m.get('title')}, Poster={m.get('poster_url')}")

print('\n=== 3. Checking Sonic 3 (TMDB 939243) Shows & Booking ===')
sonic_theatres = c.get('/api/backend/movies/939243/shows').json()
print(f'Found {len(sonic_theatres)} theatres for Sonic 3')
if sonic_theatres and len(sonic_theatres) > 0 and len(sonic_theatres[0].get('shows', [])) > 0:
    sonic_show_id = sonic_theatres[0]['shows'][0]['id']
    seats_resp = c.get(f'/api/backend/shows/{sonic_show_id}/seats').json()
    print(f"Sonic show {sonic_show_id} movie_title in seats response: '{seats_resp.get('movie_title')}' (Movie ID: {seats_resp.get('movie_id')})")
else:
    print('No shows found for Sonic 3!')

print('\n=== 4. Checking Dune 2 (TMDB 693134) Shows & Booking ===')
dune_theatres = c.get('/api/backend/movies/693134/shows').json()
print(f'Found {len(dune_theatres)} theatres for Dune 2')
if dune_theatres and len(dune_theatres) > 0 and len(dune_theatres[0].get('shows', [])) > 0:
    dune_show_id = dune_theatres[0]['shows'][0]['id']
    seats_resp = c.get(f'/api/backend/shows/{dune_show_id}/seats').json()
    print(f"Dune show {dune_show_id} movie_title in seats response: '{seats_resp.get('movie_title')}' (Movie ID: {seats_resp.get('movie_id')})")
else:
    print('No shows found for Dune 2!')

print('\n=== 5. Checking DeadPool (TMDB 533535) Shows & Booking ===')
dp_theatres = c.get('/api/backend/movies/533535/shows').json()
print(f'Found {len(dp_theatres)} theatres for Deadpool')
if dp_theatres and len(dp_theatres) > 0 and len(dp_theatres[0].get('shows', [])) > 0:
    dp_show_id = dp_theatres[0]['shows'][0]['id']
    seats_resp = c.get(f'/api/backend/shows/{dp_show_id}/seats').json()
    print(f"Deadpool show {dp_show_id} movie_title in seats response: '{seats_resp.get('movie_title')}' (Movie ID: {seats_resp.get('movie_id')})")
