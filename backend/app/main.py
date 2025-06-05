from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.database import create_db_and_tables
from app.models import user # Ensure models are imported for table creation

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

# --- Include the API v1 router ---
# All routes defined in api_v1_router will be prefixed with settings.API_V1_STR (e.g., /api/v1)
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


# Keep the root and health check on the main app if desired, or move them too
@app.get("/")
async def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME}!"}

@app.get("/health", tags=["Utilities"])
async def health_check():
    return {"status": "ok", "message": "API is healthy and running!"}