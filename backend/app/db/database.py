# E:\Marine_life\backend\app\db\database.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase # Use modern DeclarativeBase
from app.core.config import settings

# Create an ASYNCHRONOUS engine using the new property from our config
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL, # <-- THE IMPORTANT CHANGE IS HERE
    pool_pre_ping=True, # Good practice for production
    echo=settings.DEBUG
)

# Create an ASYNCHRONOUS sessionmaker
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Modern SQLAlchemy base class
class Base(DeclarativeBase):
    pass

# ASYNCHRONOUS dependency to get a DB session
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # Note: We are committing in the dependency.
            # For more complex apps, you might commit in the endpoint itself.
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# ASYNCHRONOUS function to create tables
async def create_db_and_tables():
    async with engine.begin() as conn:
        # This will create all tables that inherit from our Base class
        await conn.run_sync(Base.metadata.create_all)
    print("ASYNC: Database tables checked/created.")