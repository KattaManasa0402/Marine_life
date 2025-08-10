from celery import Celery
from app.core.config import settings

# This file should ONLY define the Celery app.
# It should not import any other parts of the application like routers or endpoints.

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    # The 'include' tells Celery where to find the tasks. This is correct.
    include=["app.tasks.ai_tasks"]
)

# --- NEW CONFIGURATION FOR ROBUSTNESS ---
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # These settings help with connection reliability
    broker_connection_retry_on_startup=True,
    broker_pool_limit=1, # Can prevent connection limit issues on free tiers
)
# --- END NEW CONFIGURATION ---