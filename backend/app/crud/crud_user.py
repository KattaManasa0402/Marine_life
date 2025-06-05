from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

async def get_user(db: AsyncSession, user_id: int) -> Optional[UserModel]:
    result = await db.execute(select(UserModel).filter(UserModel.id == user_id))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[UserModel]:
    result = await db.execute(select(UserModel).filter(UserModel.email == email))
    return result.scalar_one_or_none()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[UserModel]:
    result = await db.execute(select(UserModel).filter(UserModel.username == username))
    return result.scalar_one_or_none()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[UserModel]:
    result = await db.execute(select(UserModel).offset(skip).limit(limit))
    return result.scalars().all()

async def create_user(db: AsyncSession, user_in: UserCreate) -> UserModel:
    hashed_password_str = get_password_hash(user_in.password)
    db_user = UserModel(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password_str
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, db_user: UserModel, user_in: UserUpdate) -> UserModel:
    """
    Update an existing user's details.
    Only updates fields that are explicitly provided (not None) in user_in,
    except for boolean fields where False is a valid update.
    """
    update_data = user_in.model_dump(exclude_unset=True) # Gets only fields that were actually sent

    # Iterate through the fields provided in the input Pydantic model
    for field, value in update_data.items():
        if field == "password":
            if value is not None: # Only update password if a new one is provided
                hashed_password_str = get_password_hash(value)
                setattr(db_user, "hashed_password", hashed_password_str)
        elif value is not None: # For most other fields, only update if a non-None value is given
            setattr(db_user, field, value)
        elif isinstance(getattr(db_user, field, None), bool) and value is None and field in update_data:
            # Special handling if you want to allow explicitly setting a boolean to None
            # (which would then use its default or be null if the DB column allows it).
            # For 'is_active' and 'is_superuser', if client sends 'null', we might interpret
            # it as "no change" if that's the desired logic, or error if not allowed.
            # Current model defaults these to True/False respectively, and they are not nullable by default in the Pydantic schema.
            # If user_in sends `is_active: null`, update_data will contain `is_active: None`.
            # For `NOT NULL` booleans, we should probably not set them to None.
            # The current Pydantic UserUpdate schema has is_active: Optional[bool] = None,
            # so if the client sends "is_active": false, it will be updated.
            # If they send "is_active": null, `value` will be `None`.
            # We will only set attribute if value is not None, UNLESS it's a password which is handled above.
            # This means sending "username": null will NOT clear the username.
            # If you want to allow clearing fields that are nullable in DB, this logic would change.
            # For 'username' and 'email', since they are NOT NULL in DB, we must not set them to None.
            # The uniqueness checks in the endpoint already handle if the new value is valid.
            pass # Do nothing if value is None for a non-password field (prevents setting NOT NULL fields to None)


    # More explicit handling:
    # if update_data.get("email") is not None:
    #     db_user.email = update_data["email"]
    # if update_data.get("username") is not None:
    #     db_user.username = update_data["username"]
    # if update_data.get("password") is not None: # Check if 'password' key exists and is not None
    #     db_user.hashed_password = get_password_hash(update_data["password"])
    # if "is_active" in update_data and update_data["is_active"] is not None: # Allows setting False
    #     db_user.is_active = update_data["is_active"]
    # if "is_superuser" in update_data and update_data["is_superuser"] is not None: # Allows setting False
    #     db_user.is_superuser = update_data["is_superuser"]


    # Simpler loop that respects non-None updates for most fields, special for password:
    for field_name, value in update_data.items():
        if field_name == "password":
            if value: # Only hash and set if a new password string is provided
                setattr(db_user, "hashed_password", get_password_hash(value))
        elif value is not None: # For all other fields, only set if value is not None
             setattr(db_user, field_name, value)
        # If value is None for a field other than password, we effectively ignore it,
        # meaning we don't try to set a DB column to NULL if the client sent null.
        # This prevents errors for NOT NULL columns.
        # If you wanted to allow setting a *nullable* DB field to NULL, you'd need
        # to adjust this logic or handle those fields specifically.

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def delete_user(db: AsyncSession, user_id: int) -> Optional[UserModel]:
    db_user = await get_user(db, user_id=user_id)
    if db_user:
        await db.delete(db_user)
        await db.commit()
        return db_user
    return None