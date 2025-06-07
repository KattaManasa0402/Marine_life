from pydantic import BaseModel, EmailStr, Field, HttpUrl  # HttpUrl included for future use
from typing import Optional, List
from datetime import datetime

# --- Base User Properties ---
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

# --- User Creation ---
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

# --- User Update ---
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    # score and earned_badges are typically not updated directly by the user

# --- User in Database (Internal representation) ---
class UserInDBBase(UserBase):
    id: int
    is_active: bool = True
    is_superuser: bool = False

    # --- Gamification Fields ---
    score: int = 0
    earned_badges: List[str] = Field(default_factory=list)

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- User Response Model (Public data) ---
class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    # --- Gamification Fields ---
    score: int
    earned_badges: List[str]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- User in Database (Complete internal representation) ---
class UserInDB(UserInDBBase):
    hashed_password: str

# --- Token Data (Payload for JWT) ---
class TokenData(BaseModel):
    username: Optional[str] = None

# --- Token Response ---
class Token(BaseModel):
    access_token: str
    token_type: str
