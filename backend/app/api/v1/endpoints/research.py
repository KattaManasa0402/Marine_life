# E:\Marine_life\backend\app\api\v1\endpoints\research.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime, timezone

from app import schemas
from app.db.database import get_db
from app.models.media import MediaItem as MediaItemModel

router = APIRouter()  # Ensure this line is present and correctly defined

@router.get(
    "/data", 
    response_model=List[schemas.ResearchDataPoint],
    summary="Get anonymized research data",
    description="Provides aggregated and anonymized marine life sighting data for researchers. Includes validated species/health if available, otherwise AI predictions. This endpoint is public and has basic filtering."
)
async def get_research_data(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 1000,
    species: Optional[str] = Query(None, description="Filter by species (validated or AI predicted). Case-insensitive."),
    health_status: Optional[str] = Query(None, description="Filter by health status (validated or AI predicted). Case-insensitive."),
    date_from: Optional[datetime] = Query(None, description="Filter by sighting date from (ISO 8601 format)."),
    date_to: Optional[datetime] = Query(None, description="Filter by sighting date to (ISO 8601 format)."),
    only_validated: bool = Query(False, description="If true, only return items with community validation consensus.")
):
    query = select(MediaItemModel)
    query = (
        query.filter(MediaItemModel.latitude.isnot(None))
             .filter(MediaItemModel.longitude.isnot(None))
             .filter(MediaItemModel.sighting_timestamp.isnot(None))
    )

    if species:
        query = query.filter(
            (MediaItemModel.validated_species.ilike(f"%{species}%")) |
            (MediaItemModel.species_ai_prediction.ilike(f"%{species}%") & MediaItemModel.validated_species.is_(None))
        )
    if health_status:
        query = query.filter(
            (MediaItemModel.validated_health_status.ilike(f"%{health_status}%")) |
            (MediaItemModel.health_status_ai_prediction.ilike(f"%{health_status}%") & MediaItemModel.validated_health_status.is_(None))
        )
    
    if date_from:
        query = query.filter(MediaItemModel.sighting_timestamp >= date_from)
    if date_to:
        query = query.filter(MediaItemModel.sighting_timestamp <= date_to)

    if only_validated:
        query = query.filter(MediaItemModel.is_validated_by_community == True)

    query = query.order_by(MediaItemModel.sighting_timestamp.desc(), MediaItemModel.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    media_items_from_db = result.scalars().all()

    research_data = []
    for item in media_items_from_db:
        final_species = item.validated_species or item.species_ai_prediction
        final_health = item.validated_health_status or item.health_status_ai_prediction

        if item.latitude is None or item.longitude is None or \
           final_species is None or final_health is None or item.sighting_timestamp is None:
            continue 

        research_data.append(
            schemas.ResearchDataPoint(
                id=item.id, 
                latitude=item.latitude,
                longitude=item.longitude,
                species=final_species,
                health_status=final_health,
                sighting_timestamp=item.sighting_timestamp
            )
        )
    
    return research_data
