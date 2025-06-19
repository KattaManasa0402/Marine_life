from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from .base import Base  # <-- IMPORT Base FROM THE NEW FILE

# The engine and session setup remains the same.
engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

# We no longer define Base here. We import it.

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# This function is no longer needed since Alembic handles table creation.
# It can be safely removed.
# async def create_db_and_tables():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)