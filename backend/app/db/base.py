from sqlalchemy.orm import declarative_base

# This 'Base' object is the foundation for all our SQLAlchemy models.
# By putting it in its own file, we break the circular import.
Base = declarative_base()