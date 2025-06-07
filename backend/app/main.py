# E:\Marine_life\backend\app\main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- IMPORT THIS
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.database import create_db_and_tables
from app.models import user # Ensures models are imported

# --- Import the API v1 router ---
from app.api.v1.api_router import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup...")
    if settings.DEBUG:
        print("ASYNC: Attempting to create database tables...")
        await create_db_and_tables()
        print("ASYNC: Database tables check/creation complete.")
    yield
    print("Application shutdown...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for uploading marine life media, community discussions, and data access.",
    version="0.1.0",
    lifespan=lifespan
)

# --- ADD THIS CORS MIDDLEWARE SECTION ---
# This allows your frontend (running on localhost:3000) to talk to your backend.
origins = [
    "http://localhost:3000", # The origin of your React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# --- END CORS MIDDLEWARE SECTION ---

# --- Include the API v1 router ---
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME}!"}

@app.get("/health", tags=["Utilities"])
async def health_check():
    return {"status": "ok", "message": "API is healthy and running!"}