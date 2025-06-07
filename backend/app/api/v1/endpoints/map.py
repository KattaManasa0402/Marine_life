from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime # Ensure datetime is imported if using date filters later

from app import schemas
from app.db.database import get_db
from app.models.media import MediaItem as MediaItemModel

router = APIRouter()

@router.get(
    "/data", 
    response_model=List[schemas.MapDataPoint],
    summary="Get data for interactive map",
    description="Retrieves a list of media item locations and basic info for map display. Filters can be applied."
)
async def get_map_data_points(
    db: AsyncSession = Depends(get_db),
    skip: int = 0, 
    limit: int = 1000, 
    # Future filter ideas (can be added here):
    # species: Optional[str] = None, # Filter by validated species
    # health_status: Optional[str] = None,
    # date_from: Optional[datetime] = None,
    # date_to: Optional[datetime] = None,
    # bbox: Optional[str] = None,
):
    """
    Retrieve data points for map visualization.
    Each point includes ID, latitude, longitude, AI predictions (if available),
    validated predictions (if available), and file URL.
    Currently returns all items with valid (non-null) latitude and longitude.
    """
    query = (
        select(MediaItemModel)
        .filter(MediaItemModel.latitude.isnot(None))
        .filter(MediaItemModel.longitude.isnot(None))
        .order_by(MediaItemModel.sighting_timestamp.desc().nullslast(), MediaItemModel.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    media_items_from_db = result.scalars().all()

    map_data_points = []
    for item in media_items_from_db:
        if item.latitude is not None and item.longitude is not None:
            map_data_points.append(
                schemas.MapDataPoint(
                    id=item.id,
                    latitude=item.latitude,
                    longitude=item.longitude,
                    species_prediction=item.species_ai_prediction, # Keep AI prediction
                    health_prediction=item.health_status_ai_prediction, # Keep AI prediction
                    # --- ADD VALIDATED FIELDS ---
                    validated_species=item.validated_species,
                    validated_health=item.validated_health_status,
                    # --- END ADD ---
                    file_url=item.file_url
                )
            )
    
    return map_data_points