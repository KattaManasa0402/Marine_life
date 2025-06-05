from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache # For caching settings if needed

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "Community Marine Life Monitoring Platform API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True # Set to False in production

    # PostgreSQL Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "marine_user" # The user you created in PostgreSQL
    POSTGRES_PASSWORD: str = "Password@123" # !!! REPLACE THIS with your actual marine_user password !!!
    POSTGRES_DB: str = "marine_db"   # The database you created in PostgreSQL

    @property
    def DATABASE_URL(self) -> str:
        # Uses asyncpg driver for FastAPI's async capabilities
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # MinIO settings
    MINIO_ENDPOINT: str = "localhost:9000" # Or 127.0.0.1:9000
    MINIO_ACCESS_KEY: str = "minioadmin"    # The access key MinIO provided (default)
    MINIO_SECRET_KEY: str = "minioadmin"    # The secret key MinIO provided (default)
    MINIO_BUCKET_NAME: str = "marine-bucket" # The bucket you created in MinIO
    MINIO_USE_SSL: bool = False # Set to True if MinIO is configured with SSL

    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # RabbitMQ settings (Celery broker URL)
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672 # Default AMQP port for RabbitMQ
    RABBITMQ_USER: str = "guest" # Default RabbitMQ user
    RABBITMQ_PASSWORD: str = "guest" # Default RabbitMQ password
    
    @property
    def CELERY_BROKER_URL(self) -> str:
        return f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}//"

    @property
    def CELERY_RESULT_BACKEND(self) -> str: # Using Redis as Celery's result backend
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"


    # JWT Authentication settings
    SECRET_KEY: str = "3a7c9f2b8e1d0a6f5c4b3e2d1a0b9c8d7e6f5a4b3c2d1e0f" # !!! REPLACE THIS with a long random string !!!
    ALGORITHM: str = "HS256" # Algorithm for JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60 # Token expiry: 30 days (adjust as needed)

    # Configuration for loading from a .env file (optional for now, but good practice for later)
    # To use a .env file:
    # 1. Create a file named ".env" in your `backend` directory (E:\Marine_life\backend\.env)
    # 2. Add settings to it like: POSTGRES_PASSWORD="your_actual_password"
    # 3. Uncomment the next line:
    # model_config = SettingsConfigDict(env_file=".env", extra='ignore', env_file_encoding='utf-8')

@lru_cache() # Caches the settings object so it's created only once per application run
def get_settings() -> Settings:
    return Settings()

# Create an instance of the settings to be easily imported elsewhere in the app
settings = get_settings()