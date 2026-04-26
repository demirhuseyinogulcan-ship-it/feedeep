"""
feedeep Web Scraper - Domain Filtreleme Motoru
Alakasız siteleri (kariyer, haber, marketplace) ve URL'leri filtreler.
"""
import re
from urllib.parse import urlparse
from typing import List, Optional
from config import settings


class DomainFilter:
    """Alakasız domain ve URL'leri filtreler."""

    def __init__(self):
        self.blacklisted_domains = set(settings.BLACKLISTED_DOMAINS)
        self.blacklisted_patterns = settings.BLACKLISTED_URL_PATTERNS
        self._compiled_patterns = [
            re.compile(re.escape(p), re.IGNORECASE)
            for p in self.blacklisted_patterns
        ]

    def extract_domain(self, url: str) -> Optional[str]:
        """URL'den temel domain'i çıkar."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
            return domain if domain else None
        except Exception:
            return None

    def is_blacklisted(self, url: str) -> bool:
        """URL veya domain'in kara listede olup olmadığını kontrol et."""
        if not url:
            return True

        domain = self.extract_domain(url)
        if not domain:
            return True

        # Tam domain eşleşmesi
        if domain in self.blacklisted_domains:
            return True

        # Alt domain kontrolü
        for bd in self.blacklisted_domains:
            if domain.endswith("." + bd):
                return True

        # URL kalıp kontrolü
        url_lower = url.lower()
        for pattern in self._compiled_patterns:
            if pattern.search(url_lower):
                return True

        return False

    def is_likely_company_site(
        self, url: str, title: str = "", snippet: str = ""
    ) -> bool:
        """
        Heuristik kontrol: URL büyük ihtimalle bir firma sitesine mi ait?
        Blog platformları, kişisel siteler vb. filtrelenir.
        """
        domain = self.extract_domain(url)
        if not domain:
            return False

        # Büyük platformların subdomain'lerini atla
        large_platforms = [
            "blogspot.com", "wordpress.com", "wixsite.com",
            "medium.com", "tumblr.com", "weebly.com",
            "squarespace.com", "jimdo.com",
        ]
        for platform in large_platforms:
            if domain.endswith(platform):
                return False

        # Başlık/snippet'te olumsuz sinyaller
        negative_keywords = [
            "iş ilanı", "kariyer", "job", "vacancy", "haber",
            "news", "forum", "sözlük", "dictionary", "recipe",
            "tarif", "oyun", "game", "mp3", "izle", "watch",
            "indir", "download", "crack", "torrent",
        ]
        text = (title + " " + snippet).lower()
        for kw in negative_keywords:
            if kw in text:
                return False

        return True

    def filter_urls(self, urls: List[dict]) -> List[dict]:
        """Arama sonuçları listesini filtrele, alakasızları çıkar."""
        filtered = []
        for item in urls:
            url = item.get("url", "")
            title = item.get("title", "")
            snippet = item.get("snippet", "")

            if self.is_blacklisted(url):
                continue

            if not self.is_likely_company_site(url, title, snippet):
                continue

            filtered.append(item)

        return filtered


# Singleton instance
domain_filter = DomainFilter()

