from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Community Marine Life Monitoring Platform API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "marine_user"
    POSTGRES_PASSWORD: str = "Password%40123"
    POSTGRES_DB: str = "marine_db"
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "marine-bucket"
    MINIO_USE_SSL: bool = False
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
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
    GOOGLE_API_KEY: str = "PASTE_YOUR_GOOGLE_API_KEY_HERE"
    SECRET_KEY: str = "3a7c9f2b8e1d0a6f5c4b3e2d1a0b9c8d7e6f5a4b3c2d1e0f"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

@lru_cache()
def get_settings() -> Settings:
    return Settings()
settings = get_settings()