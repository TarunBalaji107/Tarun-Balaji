import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# SQLAlchemy requires postgresql:// instead of legacy postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_info():
    """Returns metadata about the active SQLAlchemy engine and tables."""
    inspector = inspect(engine)
    dialect_name = engine.dialect.name
    table_names = inspector.get_table_names()
    
    # Mask credentials if present
    masked_url = DATABASE_URL
    if "@" in masked_url and "://" in masked_url:
        scheme, rest = masked_url.split("://", 1)
        creds, host_part = rest.split("@", 1)
        masked_url = f"{scheme}://***:***@{host_part}"
        
    return {
        "dialect": dialect_name,
        "database_url": masked_url,
        "tables": table_names,
        "is_sqlite": dialect_name == "sqlite",
        "is_postgresql": dialect_name == "postgresql",
        "status": "connected"
    }
