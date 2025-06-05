import time
import random
# import asyncio # Not strictly needed for sync sleep

from app.celery_app import celery_app
from app.db.database import AsyncSessionLocal # Still need this for DB access
from app.crud import crud_media
import asyncio # Need this to run async DB operations from sync task

# Change task to be synchronous
@celery_app.task(name="tasks.process_media_for_ai_sync_test", bind=True) # Renamed for clarity
def process_media_for_ai_sync_test(self, media_item_id: int, file_url: str): # No longer async
    """
    SYNC TEST Celery task to simulate AI processing and update the database.
    """
    print(f"SYNC TASK STARTED: Process AI for media_item_id: {media_item_id}, file_url: {file_url}")

    processing_time = random.randint(3, 7)
    print(f"SYNC TASK INFO: Simulating AI processing for {processing_time} seconds...")
    time.sleep(processing_time) # Use time.sleep for sync tasks

    species_prediction = f"SyncSimSpecies_{random.choice(['Coral_A', 'Fish_B', 'Kelp_C'])}"
    health_prediction = f"SyncSimHealth_{random.choice(['Good', 'Moderate', 'Poor'])}"
    confidence_score = round(random.uniform(0.65, 0.98), 4)
    ai_model_version = "sync_sim_v1.1"
    processing_status = "completed_sync_test"

    print(f"SYNC TASK INFO: AI Processing complete for media_item_id: {media_item_id}.")
    print(f"  Species: {species_prediction}, Health: {health_prediction}, Confidence: {confidence_score}")

    # --- Update Database Record ---
    # To run async database code from a synchronous Celery task:
    async def update_db_async():
        async with AsyncSessionLocal() as db:
            print(f"SYNC TASK DB: Created DB session for media_item_id: {media_item_id}")
            updated_item = await crud_media.update_media_item_ai_results(
                db=db,
                media_item_id=media_item_id,
                species=species_prediction,
                health=health_prediction,
                confidence=confidence_score,
                model_version=ai_model_version,
                status=processing_status
            )
            if updated_item:
                print(f"SYNC TASK DB: Successfully updated media_item_id: {media_item_id} in DB.")
            else:
                print(f"SYNC TASK DB ERROR: Failed to find or update media_item_id: {media_item_id} in DB.")
    
    try:
        asyncio.run(update_db_async()) # Run the async DB update logic
    except Exception as e:
        print(f"SYNC TASK DB ERROR: Exception during DB update for media_item_id: {media_item_id} - {e}")
        import traceback
        traceback.print_exc()
        processing_status = "failed_exception_in_db_update_sync_test"

    return {
        "media_item_id": media_item_id, 
        "final_processing_status": processing_status,
        "simulated_species": species_prediction,
        "simulated_health": health_prediction
    }