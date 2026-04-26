"""
feedeep Web Scraper - Uygulama Yapılandırma Dosyası
Tüm ayarlar burada merkezi olarak yönetilir.
"""
import os
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # ── Veritabanı ──────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./feedeep_web_scraper.db"

    # ── API Anahtarları (opsiyonel - production için) ───
    SERPAPI_KEY: Optional[str] = None

    # ── Kazıma Ayarları ─────────────────────────────────
    SCRAPE_TIMEOUT: int = 15
    MAX_SEARCH_RESULTS: int = 300
    RATE_LIMIT_DELAY: float = 2.0
    MAX_CONCURRENT_SCRAPES: int = 5

    USER_AGENT: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    )

    # ── Kara Liste: Filtrelenecek Domainler ─────────────
    BLACKLISTED_DOMAINS: List[str] = [
        # İş ilanı siteleri
        "kariyer.net", "indeed.com", "linkedin.com", "glassdoor.com",
        "secretcv.com", "yenibiris.com", "monster.com", "jobindex.dk",
        # Pazar yerleri
        "armut.com", "sahibinden.com", "hepsiburada.com", "trendyol.com",
        "n11.com", "gittigidiyor.com", "letgo.com", "amazon.com",
        "amazon.de", "amazon.co.uk", "ebay.com", "alibaba.com",
        "aliexpress.com", "etsy.com",
        # Sosyal medya
        "facebook.com", "twitter.com", "x.com", "instagram.com",
        "youtube.com", "tiktok.com", "pinterest.com", "reddit.com",
        "vk.com", "whatsapp.com", "telegram.org",
        # Haber siteleri
        "hurriyet.com.tr", "milliyet.com.tr", "sabah.com.tr",
        "haberturk.com", "ntv.com.tr", "cnn.com", "bbc.com",
        "sozcu.com.tr", "cumhuriyet.com.tr", "haberler.com",
        "star.com.tr", "yenisafak.com", "aksam.com.tr",
        "ensonhaber.com", "internethaber.com",
        # Şikayet / Forum
        "sikayetvar.com", "eksisozluk.com", "donanimhaber.com",
        "uludagsozluk.com", "memurlar.net",
        # Diğer
        "wikipedia.org", "yemeksepeti.com", "getir.com",
        "tripadvisor.com", "booking.com", "google.com",
        "google.com.tr", "bing.com", "yahoo.com",
        "yandex.com", "duckduckgo.com",
    ]

    # ── URL Kalıp Kara Listesi ──────────────────────────
    BLACKLISTED_URL_PATTERNS: List[str] = [
        "/haber/", "/news/", "/kariyer/", "/career/",
        "/ilan/", "/listing/", "/blog/", "/forum/",
        "/makale/", "/article/", "/video/", "/watch",
    ]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
