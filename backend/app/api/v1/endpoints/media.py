# backend/app/api/v1/endpoints/media.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import cloudinary
import cloudinary.uploader

from app.db.database import get_db
from app.schemas.media import MediaItem as MediaItemSchema
from app.crud import crud_media
from app.models.user import User
from app.api.deps import get_current_active_user
from app.celery_app import celery_app
from app.core.config import settings

router = APIRouter()

# Configure Cloudinary from your settings
cloudinary.config(
  cloud_name = settings.CLOUDINARY_CLOUD_NAME,
  api_key = settings.CLOUDINARY_API_KEY,
  api_secret = settings.CLOUDINARY_API_SECRET,
  secure=True
)

@router.post("/upload", response_model=MediaItemSchema)
async def upload_media_item(
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        # Upload file content to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file.file, # Pass the file-like object directly
            folder="marine_life_uploads",
            resource_type="image"
        )
        
        file_url = upload_result.get("secure_url")
        if not file_url:
            raise HTTPException(status_code=500, detail="Cloudinary upload failed, no URL returned.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file to Cloudinary: {str(e)}")

    media_item_data = {
        "file_url": file_url,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "ai_processing_status": "pending",
    }
    
    db_item = await crud_media.create_media_item(db=db, media_item_data=media_item_data, user_id=current_user.id)
    
    celery_app.send_task("tasks.process_media_with_gemini", args=[db_item.id, db_item.file_url])

    return db_item

@router.get("/", response_model=List[MediaItemSchema])
async def read_media_items(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    media_items = await crud_media.get_media_items(db, skip=skip, limit=limit)
    return media_items

@router.get("/user/me", response_model=List[MediaItemSchema])
async def read_own_media_items(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await crud_media.get_media_items_by_user(db=db, user_id=current_user.id)

@router.get("/{id}", response_model=MediaItemSchema)
async def read_media_item(id: int, db: AsyncSession = Depends(get_db)):
    db_media_item = await crud_media.get_media_item(db, media_item_id=id)
    if db_media_item is None:
        raise HTTPException(status_code=404, detail="Media item not found")
    return db_media_item