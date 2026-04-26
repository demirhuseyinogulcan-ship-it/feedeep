"""
feedeep Web Scraper - Veritabanı Bağlantı Yönetimi
SQLAlchemy engine ve session oluşturma
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
    if "sqlite" in settings.DATABASE_URL
    else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Tüm veritabanı tablolarını oluştur."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency injection için veritabanı oturumu."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

