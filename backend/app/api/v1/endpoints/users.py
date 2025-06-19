from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app import schemas
from app import crud
from app.db.database import get_db
from app.core import security
from app.core.security import get_current_active_user
from app.models.user import User as UserModel

router = APIRouter()

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED, summary="Create a new user")
async def create_new_user(user_in: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user_by_username = await crud.crud_user.get_user_by_username(db, username=user_in.username)
    if db_user_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered.")
    
    db_user_by_email = await crud.crud_user.get_user_by_email(db, email=user_in.email)
    if db_user_by_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered.")
        
    created_user = await crud.crud_user.create_user(db=db, user_in=user_in)
    return created_user

@router.post("/login", response_model=schemas.Token, summary="User Login")
async def login_for_access_token(db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = await crud.crud_user.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user. Please contact support.")
    
    # --- FIX IS HERE ---
    # The token payload needs to contain enough information for the frontend.
    # We add the user's ID to the payload.
    access_token_data = {"sub": user.username, "id": user.id} 
    # --- END FIX ---

    access_token = security.create_access_token(data=access_token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User, summary="Get current user's details")
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.User, summary="Update current user's details")
async def update_user_me(
    user_update_in: schemas.UserUpdate, db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    if user_update_in.username and user_update_in.username != current_user.username:
        existing_user_by_new_username = await crud.crud_user.get_user_by_username(db, username=user_update_in.username)
        if existing_user_by_new_username and existing_user_by_new_username.id != current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New username is already taken by another user.")

    if user_update_in.email and user_update_in.email != current_user.email:
        existing_user_by_new_email = await crud.crud_user.get_user_by_email(db, email=user_in.email)
        if existing_user_by_new_email and existing_user_by_new_email.id != current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New email is already registered by another user.")
            
    updated_user = await crud.crud_user.update_user(db=db, db_user=current_user, user_in=user_update_in)
    return updated_user

@router.get(
    "/me/media", 
    response_model=List[schemas.MediaItem],
    summary="List media items uploaded by the current user"
)
async def read_own_media_items(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    media_items = await crud.crud_media.get_media_items(
        db=db, 
        user_id=current_user.id,
        skip=skip, 
        limit=limit
    )
    return media_items

# --- NEW PUBLIC ENDPOINT TO FETCH A USER'S PUBLIC PROFILE ---
@router.get("/{user_id}", response_model=schemas.User, summary="Get a user's public profile")
async def get_user_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Fetches a user's public profile information by their ID.
    This is what the frontend AuthContext will call.
    """
    user = await db.get(UserModel, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user