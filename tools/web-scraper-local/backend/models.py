"""
feedeep Web Scraper - Veritabanı Modelleri
SQLAlchemy ORM modelleri: Query (sorgu) ve Company (firma)
"""
import json
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean,
    Text, ForeignKey, Float
)
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime


class Base(DeclarativeBase):
    pass


class Query(Base):
    """Bir arama sorgusunu temsil eder."""
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    search_term = Column(String(500), nullable=False)
    region = Column(String(100), nullable=True)
    language = Column(String(10), default="tr")
    max_results = Column(Integer, default=50)
    search_source = Column(String(50), default="Google")
    status = Column(String(20), default="pending")
    results_count = Column(Integer, default=0)
    new_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    filtered_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    companies = relationship(
        "Company", back_populates="query", cascade="all, delete-orphan"
    )


class Company(Base):
    """Kazınan bir firmayı temsil eder."""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_id = Column(Integer, ForeignKey("queries.id"), nullable=False)
    name = Column(String(500), nullable=True)
    website = Column(String(1000), nullable=True)
    domain = Column(String(500), nullable=True, index=True)
    emails_json = Column(Text, default="[]")
    phones_json = Column(Text, default="[]")
    address = Column(Text, nullable=True)
    city = Column(String(200), nullable=True)
    country = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    source_url = Column(String(1000), nullable=True)
    google_title = Column(String(500), nullable=True)
    google_snippet = Column(Text, nullable=True)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_query_id = Column(Integer, nullable=True)
    contact_person = Column(String(300), nullable=True)
    contact_title = Column(String(300), nullable=True)
    email_variants_json = Column(Text, default="{}")
    search_source = Column(String(50), default="Google")
    confidence_score = Column(Float, default=0.0)
    scraped = Column(Boolean, default=False)
    scrape_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    query = relationship("Query", back_populates="companies")

    # ── JSON alanları için property'ler ──────────────────

    @property
    def emails(self):
        try:
            return json.loads(self.emails_json) if self.emails_json else []
        except (json.JSONDecodeError, TypeError):
            return []

    @emails.setter
    def emails(self, value):
        self.emails_json = json.dumps(value) if value else "[]"

    @property
    def phones(self):
        try:
            return json.loads(self.phones_json) if self.phones_json else []
        except (json.JSONDecodeError, TypeError):
            return []

    @phones.setter
    def phones(self, value):
        self.phones_json = json.dumps(value) if value else "[]"

    @property
    def email_variants(self):
        try:
            return json.loads(self.email_variants_json) if self.email_variants_json else {}
        except (json.JSONDecodeError, TypeError):
            return {}

    @email_variants.setter
    def email_variants(self, value):
        self.email_variants_json = json.dumps(value) if value else "{}"

    def to_dict(self):
        """API yanıtı için sözlük formatına çevir."""
        return {
            "id": self.id,
            "query_id": self.query_id,
            "name": self.name,
            "website": self.website,
            "domain": self.domain,
            "emails": self.emails,
            "phones": self.phones,
            "address": self.address,
            "city": self.city,
            "country": self.country,
            "description": self.description,
            "source_url": self.source_url,
            "google_title": self.google_title,
            "google_snippet": self.google_snippet,
            "is_duplicate": self.is_duplicate,
            "duplicate_of_query_id": self.duplicate_of_query_id,
            "contact_person": self.contact_person,
            "contact_title": self.contact_title,
            "email_variants": self.email_variants,
            "search_source": self.search_source,
            "confidence_score": self.confidence_score,
            "scraped": self.scraped,
            "scrape_error": self.scrape_error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

