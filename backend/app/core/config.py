from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "Community Marine Life Monitoring Platform API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True # Set to False in production

    # PostgreSQL Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "marine_user"
    POSTGRES_PASSWORD: str = "Password%40123"
    POSTGRES_DB: str = "marine_db"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # MinIO settings
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "marine-bucket"
    MINIO_USE_SSL: bool = False

    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # RabbitMQ settings (Celery broker URL)
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    
    @property
    def CELERY_BROKER_URL(self) -> str:
        return f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}//"

    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # --- NEW: Google Gemini API Key ---
    GOOGLE_API_KEY: str = "AIzaSyBA1ei5mQ7wip4kghPJYt_gZ-FORvvphN4"

    # JWT Authentication settings
    SECRET_KEY: str = "3a7c9f2b8e1d0a6f5c4b3e2d1a0b9c8d7e6f5a4b3c2d1e0f"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60

    # Configuration for loading from a .env file (optional)
    # model_config = SettingsConfigDict(env_file=".env", extra='ignore', env_file_encoding='utf-8')

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

