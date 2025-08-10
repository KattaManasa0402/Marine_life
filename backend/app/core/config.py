from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "marine-life-api" # Set this to your Render service name
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False # Set to False for production

    # --- PostgreSQL Database ---
    POSTGRES_SERVER: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # --- Cloudinary Object Storage ---
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # --- RabbitMQ (Celery Broker) ---
    CELERY_BROKER_URL: str

    # --- Redis (Celery Backend) ---
    CELERY_RESULT_BACKEND: str
    
    # --- Google AI ---
    GOOGLE_API_KEY: str

    # --- JWT Authentication ---
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # This allows pydantic to look for a .env file
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()