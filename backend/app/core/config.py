from pydantic_settings import BaseSettings
from functools import lru_cache

# This class now defines the expected settings.
# The actual values will be loaded automatically from the .env file.
# We remove the hardcoded default values for all secrets.
class Settings(BaseSettings):
    PROJECT_NAME: str = "Community Marine Life Monitoring Platform API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # --- PostgreSQL Database ---
    POSTGRES_SERVER: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    
    # This @property is a clean way to build the URL from other settings
    @property
    def DATABASE_URL(self) -> str:
        # Note: We use asyncpg for the asynchronous driver
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # --- MinIO Object Storage ---
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET_NAME: str
    MINIO_USE_SSL: bool = False
    MINIO_SECURE: bool = False

    # --- Redis Cache (for Celery results) ---
    REDIS_HOST: str
    REDIS_PORT: int

    # --- RabbitMQ (Celery Broker) ---
    RABBITMQ_HOST: str
    RABBITMQ_PORT: int
    RABBITMQ_USER: str
    RABBITMQ_PASSWORD: str
    
    @property
    def CELERY_BROKER_URL(self) -> str:
        return f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}//"
    
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        
    # --- Google AI ---
    GOOGLE_API_KEY: str

    # --- JWT Authentication ---
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # New setting for AI mock data
    DEBUG_AI_MOCK: bool = False

    # CORS Origins (adjust in production)

    # This allows pydantic to look for a .env file
    class Config:
        env_file = ".env"

# The lru_cache decorator creates a singleton-like pattern for the settings
@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Global settings object to be used throughout the application
settings = get_settings()