from fastapi import APIRouter

from app.api.v1.endpoints import users
from app.api.v1.endpoints import media
from app.api.v1.endpoints import map  # Import the map router module

api_v1_router = APIRouter()

api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(media.router, prefix="/media", tags=["Media"])
api_v1_router.include_router(map.router, prefix="/map", tags=["Map"])  # Include the map router
