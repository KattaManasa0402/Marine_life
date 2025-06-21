import asyncio
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import AsyncSessionLocal
from app.models.media import MediaItem
from sqlalchemy import delete, select

async def delete_all_sightings():
    async with AsyncSessionLocal() as db:
        # Count current media items
        result = await db.execute(select(MediaItem))
        all_items = result.scalars().all()
        count = len(all_items)
        if count == 0:
            print("✅ No sightings to delete.")
            return
        # Delete all media items
        await db.execute(delete(MediaItem))
        await db.commit()
        print(f"✅ Deleted {count} sightings from the database.")

if __name__ == "__main__":
    asyncio.run(delete_all_sightings()) 