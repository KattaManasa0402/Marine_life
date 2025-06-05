from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession # Ensure async imports
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Optional: Keep the print statement for one more run if you like, then remove
print(f"DEBUG (ASYNC): Attempting to connect to DATABASE_URL: '{settings.DATABASE_URL}'") 

# Create an ASYNCHRONOUS engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create an ASYNCHRONOUS sessionmaker
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession, # For async sessions
    expire_on_commit=False,
)

Base = declarative_base()

# ASYNCHRONOUS dependency to get a DB session
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# ASYNCHRONOUS function to create tables
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("ASYNC: Database tables checked/created (if any models were defined and imported).")