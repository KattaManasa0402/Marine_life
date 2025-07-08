from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from .base import Base  # Assuming you have a base.py file as per standard practice

# Use the new, intelligent property from your config file.
# This property automatically handles the URL for both Render and local development,
# and includes the necessary driver fix.
engine = create_async_engine(settings.ASYNC_DATABASE_URL, pool_pre_ping=True)

AsyncSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession
)

async def get_db():
    """
    Dependency to get a new database session for each request.
    """
    async with AsyncSessionLocal() as session:
        yield session

# REMOVED: The `create_db_and_tables` function.
# This function is not recommended for production environments where you should
# be using a migration tool like Alembic to manage your database schema.
# Your original server deployment plan already included `alembic upgrade head`,
# which is the correct approach. If your application still relies on this
# `create_db_and_tables` function at startup, we may need to temporarily 
# re-add it, but it's best to remove it.