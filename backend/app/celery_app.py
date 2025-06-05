from celery import Celery
from app.core.config import settings  # Your application settings

# Initialize the Celery application
# The first argument is typically the name of the current module.
# - broker: URL of the message broker (RabbitMQ from your settings).
# - backend: URL of the result backend (Redis from your settings).
# - include: A list of modules where Celery should look for tasks.
# We'll create our tasks in 'app.tasks.ai_tasks'.

celery_app = Celery(
    "worker",  # Can be any name, often related to the project or main module
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.ai_tasks"]  # We will create this tasks module next
)

# Optional Celery configuration (can also be in a separate config file)
celery_app.conf.update(
    task_serializer="json",  # How tasks and results are serialized
    accept_content=["json"],  # Accepted content types
    result_serializer="json",  # How results are serialized
    timezone=getattr(settings, "PROJECT_TIMEZONE", "UTC"),  # Optional: Set project timezone
    enable_utc=True,  # Recommended to use UTC for Celery
    # task_track_started=True,  # If you want tasks to report 'STARTED' state
    # worker_prefetch_multiplier=1,  # Can be adjusted for task types (1 is good for long tasks)
    # task_acks_late=True,  # Tasks acknowledged after completion/failure (good for idempotency concerns)
)

# If you want to use a custom configuration from settings:
# celery_app.config_from_object(settings, namespace='CELERY')
# This would look for settings like CELERY_TASK_SERIALIZER, etc. in your Settings class.
# For now, the direct update above is fine.

if __name__ == "__main__":
    # This allows running celery worker directly using: python -m app.celery_app worker -l info
    # However, the standard way is: celery -A app.celery_app.celery_app worker -l info
    # (or celery -A app.celery_app worker -l info if celery_app is the instance name)
    celery_app.start()
