# E:\Marine_life\backend\app\main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.database import create_db_and_tables
from app.api.v1.api_router import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup...")
    # This check is useful to avoid running create_db_and_tables in production
    # if you manage migrations with Alembic.
    if settings.DEBUG:
        print("ASYNC: Attempting to create database tables...")
        await create_db_and_tables()
        print("ASYNC: Database tables check/creation complete.")
    yield
    print("Application shutdown...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for uploading marine life media, community discussions, and data access.",
    version="1.0.0",
    lifespan=lifespan
)

# --- REVISED CORS MIDDLEWARE SECTION ---
# This new logic reads the allowed origins from your settings file,
# which we will set in the Render environment.
origins = []
if settings.CORS_ORIGINS:
    # This splits the string "http://url1.com,http://url2.com" into a list
    origins.extend([origin.strip() for origin in settings.CORS_ORIGINS.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# --- END CORS MIDDLEWARE SECTION ---

app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME}!"}

@app.get("/health", tags=["Utilities"])
async def health_check():
    return {"status": "ok", "message": "API is healthy and running!"}