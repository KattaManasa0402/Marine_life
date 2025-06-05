from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# --- Base User Properties ---
# Properties shared by all User schemas.
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

# --- User Creation ---
# Properties required when creating a new user.
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

# --- User Update ---
# Properties that can be updated for an existing user (all optional).
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

# --- User in Database (Internal representation, base) ---
# Represents fields as they are in the database, including DB-generated ones.
class UserInDBBase(UserBase):
    id: int
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # Pydantic V2 (formerly orm_mode)

# --- User Response Model (Publicly visible user data) ---
# Schema for data returned to the client (excludes sensitive info like password).
class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- User in Database (Complete internal representation) ---
# Includes ALL fields from the database, including sensitive ones like 'hashed_password'.
# Typically NOT used for API responses. Useful for internal logic.
class UserInDB(UserInDBBase):
    hashed_password: str


# --- NEW SCHEMAS FOR TOKEN HANDLING ---

# --- Token Data (Payload for JWT) ---
# This schema defines the data that will be encoded into the JWT.
# 'sub' (subject) is a standard claim for the principal that is the subject of the JWT.
class TokenData(BaseModel):
    username: Optional[str] = None 
    # You could also include user_id or other non-sensitive identifiers here.
    # For example: user_id: Optional[int] = None

# --- Token Response ---
# This schema defines the structure of the response when a token is issued (e.g., after login).
class Token(BaseModel):
    access_token: str
    token_type: str # Typically "bearer"