from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.ai_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    
    # --- KEY CHANGE FOR CONNECTION RELIABILITY ---
    # This ensures connections are released back to the pool after use,
    # preventing stale connections from being used.
    broker_pool_limit=10, # Allow multiple connections in the pool
    broker_heartbeat=30, # Check connection health every 30 seconds
    broker_connection_timeout=60, # Timeout for establishing a connection
    broker_connection_max_retries=None, # Retry forever
)