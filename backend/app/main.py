"""FastAPI application initialization and router mounting."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, movies, shows, bookings

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    """Check API service health and runtime readiness."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}