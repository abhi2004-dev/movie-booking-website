import asyncio
import httpx

async def attempt_hold(client, user_id):
    response = await client.post(
        "http://127.0.0.1:8000/shows/2/seats/hold",  # Updated to show_id 2
        json={"seat_ids": [1]}
    )
    print(f"User {user_id} Result: {response.status_code} - {response.json()}")

async def main():
    async with httpx.AsyncClient() as client:
        # Fire two hold requests for Seat 1 at the exact same time
        await asyncio.gather(
            attempt_hold(client, user_id="A"),
            attempt_hold(client, user_id="B")
        )

if __name__ == "__main__":
    asyncio.run(main())