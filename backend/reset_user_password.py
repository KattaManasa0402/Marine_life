import asyncio
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import text

async def reset_password_and_make_superuser(username: str, new_password: str):
    async with AsyncSessionLocal() as db:
        # Reset password
        result = await db.execute(
            text("SELECT * FROM users WHERE username = :username"),
            {"username": username}
        )
        user = result.fetchone()
        if not user:
            print(f"❌ User '{username}' not found.")
            return
        hashed_password = get_password_hash(new_password)
        await db.execute(
            text("UPDATE users SET hashed_password = :hashed_password WHERE username = :username"),
            {"hashed_password": hashed_password, "username": username}
        )
        await db.execute(
            text("UPDATE users SET is_superuser = :is_superuser WHERE username = :username"),
            {"is_superuser": True, "username": username}
        )
        await db.commit()
        print(f"✅ Password for user '{username}' has been reset to: {new_password}")
        print(f"✅ User '{username}' is now a superuser.")

if __name__ == "__main__":
    # Change these values as needed
    username = "user1"
    new_password = "newpassword123"
    asyncio.run(reset_password_and_make_superuser(username, new_password)) 