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
    
    # --- AGGRESSIVE CONNECTION SETTINGS ---
    broker_pool_limit=1,
    broker_heartbeat=10,
    broker_connection_timeout=30,
    broker_connection_max_retries=None,
    
    broker_transport_options={
        'confirm_publish': True,
        'visibility_timeout': 3600,
        'heartbeat': 10,
    }
    # --- END OF SETTINGS ---
)