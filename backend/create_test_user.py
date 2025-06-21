import asyncio
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import AsyncSessionLocal
from app.crud.crud_user import create_user
from app.schemas.user import UserCreate

async def create_test_user():
    """Create a test user account for development purposes."""
    
    # Test user credentials
    test_user = UserCreate(
        username="testuser",
        email="test@example.com", 
        password="password123"
    )
    
    async with AsyncSessionLocal() as db:
        try:
            user = await create_user(db, test_user)
            print(f"✅ Test user created successfully!")
            print(f"   Username: {user.username}")
            print(f"   Email: {user.email}")
            print(f"   User ID: {user.id}")
            print(f"   Password: password123")
            print("\nYou can now use these credentials to log in and delete media items.")
        except Exception as e:
            print(f"❌ Error creating test user: {e}")
            print("The user might already exist. Try different credentials.")

if __name__ == "__main__":
    asyncio.run(create_test_user()) 