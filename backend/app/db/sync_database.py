from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create a synchronous database URL by replacing the async driver part
SYNC_DATABASE_URL = settings.DATABASE_URL.replace("+asyncpg", "")

# Create a standard, synchronous engine for use ONLY by Celery tasks
sync_engine = create_engine(SYNC_DATABASE_URL)

# Create a session factory for this synchronous engine
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)