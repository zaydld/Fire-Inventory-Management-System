import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.settings import settings

logger = logging.getLogger(__name__)

try:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True
    )
except Exception:
    logger.exception("Database connection failed")
    raise

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
