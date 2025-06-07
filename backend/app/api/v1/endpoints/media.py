from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from datetime import datetime

from app import schemas
from app import crud
from app.db.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User as UserModel
from app.services import minio_service

# --- CHANGE HERE: IMPORT THE REAL GEMINI TASK ---
from app.tasks.ai_tasks import process_media_with_gemini
# --- END CHANGE ---

router = APIRouter()

# --- Points Configuration ---
POINTS_FOR_UPLOAD = 10
# --- END Points Configuration ---


@router.post(
    "/upload",
    response_model=schemas.MediaItem,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new media file",
    description="Allows an authenticated user to upload a media file (photo/video) and associated metadata."
)
async def upload_new_media(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
    file: UploadFile = File(..., description="The media file to upload (photo or video)."),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    sighting_timestamp_str: Optional[str] = Form(None),
    description: Optional[str] = Form(None, max_length=1000)
):
    if not minio_service.minio_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Object storage service is not available."
        )

    if not file.content_type or not (
        file.content_type.startswith("image/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images and videos are allowed."
        )

    try:
        file_url = await minio_service.upload_file_to_minio(file=file)
        if not file_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not upload file to object storage."
            )

        sighting_dt: Optional[datetime] = None
        if sighting_timestamp_str:
            try:
                if sighting_timestamp_str.endswith("Z"):
                    sighting_dt = datetime.fromisoformat(sighting_timestamp_str[:-1] + "+00:00")
                else:
                    sighting_dt = datetime.fromisoformat(sighting_timestamp_str)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid sighting_timestamp format. Use ISO 8601 format."
                )

        media_item_metadata: Dict[str, Any] = {
            "file_url": file_url,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "latitude": latitude,
            "longitude": longitude,
            "sighting_timestamp": sighting_dt,
            "description": description,
            "ai_processing_status": "pending"
        }

        media_item_data_for_db = {k: v for k, v in media_item_metadata.items() if v is not None}

        created_media_item = await crud.crud_media.create_media_item(
            db=db, media_item_data=media_item_data_for_db, user_id=current_user.id
        )

        if created_media_item:
            print(
                f"Sending AI processing task for media_item_id: {created_media_item.id}, "
                f"URL: {created_media_item.file_url}"
            )
            
            # --- CHANGE HERE: CALL THE REAL GEMINI TASK ---
            process_media_with_gemini.delay(
                media_item_id=created_media_item.id,
                file_url=created_media_item.file_url
            )
            # --- END CHANGE ---

            await crud.crud_user.add_score_and_check_badges(
                db=db, user=current_user, points=POINTS_FOR_UPLOAD
            )
            print(f"User {current_user.username} awarded {POINTS_FOR_UPLOAD} points for upload.")

        return created_media_item

    except minio_service.S3Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage error during upload: {e}"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"An unexpected error occurred in upload_new_media: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the upload."
        )


# --- GET / (List Media Items - existing) ---
@router.get("/", response_model=List[schemas.MediaItem], summary="List all media items")
async def read_media_items_list(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    species_filter: Optional[str] = None
):
    media_items = await crud.crud_media.get_media_items(
        db=db, skip=skip, limit=limit, user_id=user_id, species_filter=species_filter
    )
    return media_items


# --- GET /{media_item_id} (Get Single Media Item - existing) ---
@router.get("/{media_item_id}", response_model=schemas.MediaItem, summary="Get a specific media item by ID")
async def read_single_media_item(
    media_item_id: int,
    db: AsyncSession = Depends(get_db)
):
    db_media_item = await crud.crud_media.get_media_item(db, media_item_id=media_item_id)
    if db_media_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    return db_media_item


# --- PUT /{media_item_id} (Update Media Item - existing) ---
@router.put("/{media_item_id}", response_model=schemas.MediaItem, summary="Update a specific media item")
async def update_existing_media_item(
    media_item_id: int,
    media_update_in: schemas.MediaItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_media_item = await crud.crud_media.get_media_item(db, media_item_id=media_item_id)
    if db_media_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    if db_media_item.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this media item")
    updated_media_item = await crud.crud_media.update_media_item(
        db=db, db_media_item=db_media_item, media_item_in=media_update_in
    )
    return updated_media_item


# --- DELETE /{media_item_id} (Delete Media Item - existing) ---
@router.delete("/{media_item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a specific media item")
async def delete_single_media_item(
    media_item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_media_item = await crud.crud_media.get_media_item(db, media_item_id=media_item_id)
    if db_media_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    if db_media_item.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this media item")
    file_url_to_delete = db_media_item.file_url
    minio_deletion_successful = minio_service.delete_file_from_minio(file_url=file_url_to_delete)
    if not minio_deletion_successful:
        print(f"Warning: Failed to delete file from MinIO: {file_url_to_delete}. Proceeding with DB record deletion.")
    deleted_db_item = await crud.crud_media.delete_media_item(db, media_item_id=media_item_id)
    if deleted_db_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item was found but could not be deleted from database."
        )
    return None


# --- GET /user/me (List My Media Items) ---
@router.get("/user/me", response_model=List[schemas.MediaItem])
async def list_my_media(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get all media items uploaded by the current logged-in user.
    """
    return await crud.crud_media.get_media_items_by_user(db=db, user_id=current_user.id)