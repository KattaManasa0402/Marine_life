from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

# This class defines all expected settings.
# Pydantic will automatically load values from environment variables.
# For local development, it will also load them from the .env file.
class Settings(BaseSettings):
    PROJECT_NAME: str = "Community Marine Life Monitoring Platform API"
    API_V1_STR: str = "/api/v1"
    
    # --- RENDER DEPLOYMENT SETTINGS ---
    # These single URLs are provided by Render's environment.
    # They are optional because they won't exist in your local .env file.
    DATABASE_URL: Optional[str] = None
    REDIS_URL: Optional[str] = None
    
    # --- LOCAL DEVELOPMENT SETTINGS ---
    # These will be used ONLY if DATABASE_URL and REDIS_URL are not set.
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: Optional[int] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    REDIS_HOST: Optional[str] = None
    REDIS_PORT: Optional[int] = None
    
    # --- MINIO OBJECT STORAGE (Placeholders for now) ---
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET_NAME: str
    MINIO_USE_SSL: bool = True # Set to True for cloud services

    # --- RABBITMQ (We will set this up later) ---
    RABBITMQ_HOST: Optional[str] = "localhost" # Placeholder
    RABBITMQ_PORT: Optional[int] = 5672       # Placeholder
    RABBITMQ_USER: Optional[str] = "guest"     # Placeholder
    RABBITMQ_PASSWORD: Optional[str] = "guest" # Placeholder

    # --- GOOGLE AI & JWT AUTHENTICATION ---
    GOOGLE_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # --- @property methods now intelligently decide which variables to use ---

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """
        Provides the correct SQLAlchemy URL for async connections.
        - Uses the RENDER `DATABASE_URL` if available.
        - Otherwise, builds it from local settings.
        - Ensures the driver is `postgresql+asyncpg`.
        """
        if self.DATABASE_URL:
            # Render provides a "postgres://" URL, we must make it compatible.
            return self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")
        else:
            # Fallback for local development
            return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def CELERY_BROKER_URL(self) -> str:
        # TODO: This will need to be updated with a cloud AMQP service URL later.
        return f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}//"
    
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        """
        Provides the correct Redis URL for Celery.
        - Uses the RENDER `REDIS_URL` if available.
        - Otherwise, builds it from local settings.
        """
        if self.REDIS_URL:
            return self.REDIS_URL
        else:
            return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

# The lru_cache decorator creates a singleton-like pattern for the settings
@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Global settings object to be used throughout the application
settings = get_settings()