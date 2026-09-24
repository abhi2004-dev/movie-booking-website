from locust import HttpUser, task, between
import uuid

class MovieBookingUser(HttpUser):
    # Minimal wait time to maximize collision probability
    wait_time = between(0.01, 0.1)

    @task
    def attempt_concurrent_seat_lock(self):
        """
        Simulates multiple users attempting to lock the exact same seat 
        for the same show simultaneously.
        """
        # Targeting show_id 2 and seat_id 9 which are confirmed available in Postgres
        show_id = 2
        payload = {
            "seat_ids": [9]
        }
        
        # We catch the response to mark 400/409 (Seat Unavailable) as a SUCCESS for the test,
        # because the system correctly rejecting a double-book is the desired behavior.
        with self.client.post(
            f"/shows/{show_id}/seats/hold", 
            json=payload, 
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code in [400, 409]:
                # The Redis lock successfully blocked the concurrent request
                response.success()
            else:
                response.failure(f"Failed with unexpected status: {response.status_code}")

    @task(3)
    def browse_movie_catalog(self):
        """Simulates background read-heavy traffic on the TMDB/Redis cache."""
        self.client.get("/movies/search")