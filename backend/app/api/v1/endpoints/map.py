from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select  # For select statement
from typing import List, Optional

from app import schemas  # To access schemas.MapDataPoint
from app.db.database import get_db  # Our DB session dependency
from app.models.media import MediaItem as MediaItemModel  # SQLAlchemy MediaItem model

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
    # Future filter ideas:
    # species: Optional[str] = None,
    # health_status: Optional[str] = None,
    # date_from: Optional[datetime] = None,
    # date_to: Optional[datetime] = None,
    # bbox: Optional[str] = None,  # Bounding box: min_lon,min_lat,max_lon,max_lat
):
    """
    Retrieve data points for map visualization.
    Each point includes ID, latitude, longitude, AI predictions (if available), and file URL.
    Currently returns all items with valid (non-null) latitude and longitude.
    """
    # Construct the query to select media items that have both latitude and longitude
    query = (
        select(MediaItemModel)
        .filter(MediaItemModel.latitude.isnot(None))
        .filter(MediaItemModel.longitude.isnot(None))
        .order_by(
            MediaItemModel.sighting_timestamp.desc().nullslast(),
            MediaItemModel.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    media_items_from_db = result.scalars().all()

    # Transform SQLAlchemy models to Pydantic schemas
    map_data_points = []
    for item in media_items_from_db:
        map_data_points.append(
            schemas.MapDataPoint(
                id=item.id,
                latitude=item.latitude,
                longitude=item.longitude,
                species_prediction=item.species_ai_prediction,
                health_prediction=item.health_status_ai_prediction,
                file_url=item.file_url
                # thumbnail_url can be added later if you generate thumbnails
            )
        )

    return map_data_points
