# E:\Marine_life\backend\app\api\v1\api_router.py
from fastapi import APIRouter
from app.api.v1.endpoints import users
from app.api.v1.endpoints import media
from app.api.v1.endpoints import map
from app.api.v1.endpoints import validation
from app.api.v1.endpoints import research  # <-- THIS IMPORT IS CRUCIAL

api_v1_router = APIRouter()

api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(media.router, prefix="/media", tags=["Media"])
api_v1_router.include_router(map.router, prefix="/map", tags=["Map"])
api_v1_router.include_router(validation.router, prefix="/validation", tags=["Validation"])
api_v1_router.include_router(research.router, prefix="/research", tags=["Research"])  # <-- THIS INCLUDE IS CRUCIAL
