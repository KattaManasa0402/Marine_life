# E:\Marine_life\backend\app\core\config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # This tells Pydantic to load variables from a .env file locally.
    # On Render, these will be set as environment variables.
    model_config = SettingsConfigDict(env_file=".env", extra='ignore', env_file_encoding='utf-8')

    # --- Application Settings ---
    PROJECT_NAME: str = "Community Marine Life Monitoring Platform API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    CORS_ORIGINS: str

    # --- Database Settings ---
    # For local dev, these are read from .env. On Render, DATABASE_URL is set directly.
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: Optional[int] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None

    # This logic allows DATABASE_URL to be set directly on Render,
    # while still building it from parts for local development.
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # --- Cloudinary Settings (New) ---
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # --- Celery / Redis Settings ---
    # On Render, these will be set directly. These defaults are for local dev.
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # --- Secrets ---
    GOOGLE_API_KEY: str
    SECRET_KEY: str

    # --- JWT Authentication Settings ---
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60


@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()