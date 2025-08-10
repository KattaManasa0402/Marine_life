from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
# We remove this as Alembic will handle it now
# from app.db.database import create_db_and_tables 
from app.api.v1.api_router import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup...")
    # The line below is removed. In a real production setup, you would run
    # 'alembic upgrade head' manually during deployment.
    # await create_db_and_tables() 
    yield
    print("Application shutdown...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for uploading marine life media, community discussions, and data access.",
    version="1.0.0",
    lifespan=lifespan
)

origins = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001","https://marine-life-frontend.onrender.com" ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"], # Using a wildcard for simplicity during development
    expose_headers=["Content-Length", "Content-Disposition"],
    max_age=600,
)

app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME}!"}

@app.get("/health", tags=["Utilities"])
async def health_check():
    return {"status": "ok", "message": "API is healthy and running!"}