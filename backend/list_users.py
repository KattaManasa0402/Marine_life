import asyncio
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import AsyncSessionLocal
from app.models.user import User

async def list_all_users():
    """List all registered users in the database."""
    
    async with AsyncSessionLocal() as db:
        try:
            # Get all users
            result = await db.execute("SELECT id, username, email, is_active, is_superuser, created_at FROM users ORDER BY created_at DESC")
            users = result.fetchall()
            
            if not users:
                print("❌ No users found in the database.")
                return
            
            print(f"✅ Found {len(users)} registered user(s):")
            print("-" * 80)
            print(f"{'ID':<4} {'Username':<15} {'Email':<25} {'Active':<8} {'Superuser':<10} {'Created'}")
            print("-" * 80)
            
            for user in users:
                print(f"{user[0]:<4} {user[1]:<15} {user[2]:<25} {'Yes' if user[3] else 'No':<8} {'Yes' if user[4] else 'No':<10} {user[5]}")
            
            print("-" * 80)
            print("\n💡 To log in with any of these accounts, use the username and password you set during registration.")
            
        except Exception as e:
            print(f"❌ Error listing users: {e}")

if __name__ == "__main__":
    asyncio.run(list_all_users()) 