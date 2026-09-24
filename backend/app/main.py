"""FastAPI application initialization and router mounting."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services.cache import is_redis_online
from app.routers import auth, movies, shows, bookings

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):[0-9]+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(shows.router)
app.include_router(bookings.router)


@app.get("/health", tags=["health"])
def health_check():
    """Check API service health, cache status, and runtime readiness."""
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "redis_connected": is_redis_online(),
        "database": "postgresql",
        "concurrency_mode": "hybrid_redis_memory"
    }