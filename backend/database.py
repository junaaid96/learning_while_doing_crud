import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()  # reads values from the .env file into os.environ

# Build the PostgreSQL connection URL from environment variables
# Format: postgresql://user:password@host:port/database_name
DATABASE_URL = (
    f"postgresql://{os.getenv('DB_USER', 'postgres')}"
    f":{os.getenv('DB_PASSWORD', 'postgres')}"
    f"@{os.getenv('DB_HOST', 'localhost')}"
    f":{os.getenv('DB_PORT', '5432')}"
    f"/{os.getenv('DB_NAME', 'todo_db')}"
)

# create_engine connects Python to the database
# pool_size: max persistent connections kept open
# max_overflow: extra connections allowed beyond pool_size during traffic spikes
engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10)

# Each request gets its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all our models will inherit from
Base = declarative_base()


def get_db():
    """
    Dependency function — FastAPI calls this automatically to provide
    a database session to any route that needs it.
    Closes the session after the request finishes (finally block).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
