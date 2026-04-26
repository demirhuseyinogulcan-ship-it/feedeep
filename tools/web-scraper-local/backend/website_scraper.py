"""
feedeep Web Scraper - Gelişmiş Web Sitesi Kazıyıcı
Firma web sitelerinden iletişim bilgilerini (e-posta, telefon, adres, kişi) çıkarır.
Strateji:
  1. Ana sayfayı ziyaret et → firma adı, açıklama, JSON-LD
  2. İletişim sayfalarını bul (skorlama + fallback) → e-posta, telefon, adres
  3. Hakkımızda sayfasını kontrol et → ek bilgi, kişi/ünvan
  4. 7 katmanlı e-posta çıkarma (JSON-LD, mailto, obfuscated, script vb.)
  5. Kişi adı/ünvan çıkarma + email türev üretimi
"""
import re
import logging
from typing import Optional, Dict, List, Tuple
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from email_extractor import (
    extract_emails_from_html,
    extract_phones_from_html,
    extract_address_from_jsonld,
    extract_person_details,
    generate_email_variants,
    generate_variants_from_domain,
)
from config import settings

logger = logging.getLogger(__name__)

# ── İletişim sayfası URL kalıpları (35+ pattern, skorlama ile) ──
CONTACT_URL_PATTERNS = [
    r'/iletisim', r'/iletişim', r'/contact', r'/kontakt', r'/contacto',
    r'/bize-ulasin', r'/bize-ulas', r'/ulasin', r'/reach-us',
    r'/get-in-touch', r'/kontakta', r'/contactez',
]

CONTACT_TEXT_KEYWORDS = [
    'iletişim', 'iletisim', 'contact', 'bize ulaşın', 'bize ulasin',
    'kontakt', 'contacto', 'reach us', 'get in touch',
    'e-posta', 'e-mail', 'email', 'mail',
    'ulaşın', 'teklif', 'quote', 'talep', 'request',
    'satın alma', 'satınalma', 'satinalma', 'purchase', 'purchasing',
    'sipariş', 'siparis', 'order', 'form',
]

ABOUT_URL_PATTERNS = [
    r'/about', r'/hakkimizda', r'/hakkımızda', r'/hakkinda',
    r'/kurumsal', r'/corporate', r'/about-us', r'/who-we-are',
    r'/ueber-uns', r'/uber-uns', r'/chi-siamo',
]

ABOUT_TEXT_KEYWORDS = [
    'hakkımızda', 'hakkimizda', 'about us', 'about',
    'kurumsal', 'corporate', 'über uns', 'chi siamo',
]

# ── Fallback iletişim sayfası yolları (site'da link yoksa dene) ──
FALLBACK_CONTACT_PATHS = [
    '/iletisim', '/contact', '/contact-us', '/bize-ulasin',
    '/en/contact', '/tr/iletisim', '/de/kontakt',
    '/es/contacto', '/fr/contact', '/it/contatti',
    '/iletisim/', '/contact/', '/kontakt/',
    '/iletisim.html', '/contact.html',
]

FALLBACK_ABOUT_PATHS = [
    '/hakkimizda', '/about', '/about-us', '/kurumsal',
    '/en/about', '/tr/hakkimizda',
]


class WebsiteScraper:
    """Gelişmiş firma web sitesi kazıyıcı."""

    def __init__(self):
        self.timeout = settings.SCRAPE_TIMEOUT
        self.headers = {
            "User-Agent": settings.USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }

    def scrape(self, url: str) -> Dict:
        """
        Bir web sitesini kazı ve firma bilgilerini döndür.
        Yeni: contact_person, contact_title, email_variants alanları.
        """
        result = {
            "name": None,
            "emails": [],
            "phones": [],
            "address": None,
            "description": None,
            "website": url,
            "domain": self._extract_domain(url),
            "contact_person": None,
            "contact_title": None,
            "email_variants": {},
        }

        try:
            # 1. Ana sayfayı getir
            main_html, main_soup = self._fetch_page(url)
            if not main_soup:
                return result

            result["name"] = self._extract_company_name(main_soup, url)
            result["description"] = self._extract_description(main_soup)

            # Tüm HTML biriktirme
            all_html = main_html or ""

            # 2. İletişim sayfalarını bul (skorlama ile, en iyi 3)
            contact_urls = self._find_contact_pages(main_soup, url)
            if not contact_urls:
                # Fallback yolları dene
                contact_urls = self._try_fallback_paths(url, FALLBACK_CONTACT_PATHS)

            for contact_url in contact_urls[:3]:  # Maks 3 iletişim sayfası
                if contact_url == url:
                    continue
                contact_html, contact_soup = self._fetch_page(contact_url)
                if contact_html:
                    all_html += "\n" + contact_html
                    if not result["address"] and contact_soup:
                        result["address"] = self._extract_address(contact_soup)

            # 3. Hakkımızda sayfasını kontrol et
            about_url = self._find_page_by_patterns(
                main_soup, url, ABOUT_URL_PATTERNS, ABOUT_TEXT_KEYWORDS
            )
            if not about_url:
                fallback_abouts = self._try_fallback_paths(url, FALLBACK_ABOUT_PATHS)
                about_url = fallback_abouts[0] if fallback_abouts else None

            visited = set(contact_urls + [url])
            if about_url and about_url not in visited:
                about_html, _ = self._fetch_page(about_url)
                if about_html:
                    all_html += "\n" + about_html

            # 4. 7 katmanlı e-posta çıkarma (HTML bazlı)
            domain = self._extract_domain(url)
            result["emails"] = extract_emails_from_html(all_html, domain)[:15]
            result["phones"] = extract_phones_from_html(all_html)[:10]

            # JSON-LD adres (eğer normal çıkarma bulamadıysa)
            if not result["address"]:
                result["address"] = extract_address_from_jsonld(all_html)

            # 5. Kişi adı/ünvan çıkarma
            person_name, person_title = extract_person_details(all_html)
            result["contact_person"] = person_name
            result["contact_title"] = person_title

            # 6. Email türev üretimi
            if result["emails"]:
                result["email_variants"] = generate_email_variants(result["emails"][0])
            elif domain:
                result["email_variants"] = generate_variants_from_domain(domain)

            # 7. E-posta bulunamazsa yaygın adresleri öner
            if not result["emails"] and domain:
                result["emails"] = self._generate_common_emails(domain)

        except Exception as e:
            logger.error(f"Kazıma hatası {url}: {e}")

        return result

    # ── İletişim Sayfası Bulma (Skorlama ile) ──────────────

    def _find_contact_pages(
        self, soup: BeautifulSoup, base_url: str
    ) -> List[str]:
        """
        İletişim sayfalarını skorlama algoritması ile bul.
        Her link'e URL pattern + metin keyword eşleşme puanı ver.
        En yüksek puanlı 8 URL'yi döndür.
        """
        candidates: List[Tuple[str, int]] = []

        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            text = a.get_text(strip=True).lower()

            if href.startswith("mailto:") or href.startswith("tel:"):
                continue

            score = 0
            lower_href = href.lower()

            # URL pattern eşleşmesi (+6 puan)
            for pattern in CONTACT_URL_PATTERNS:
                if re.search(pattern, lower_href):
                    score += 6
                if re.search(pattern, text):
                    score += 6

            # Metin keyword eşleşmesi (+2 puan)
            for kw in CONTACT_TEXT_KEYWORDS:
                if kw in lower_href:
                    score += 2
                if kw in text:
                    score += 2

            if "contact" in lower_href or "ilet" in lower_href:
                score += 2

            if score <= 0:
                continue

            full_url = urljoin(base_url, href)
            candidates.append((full_url, score))

        # Deduplicate — en yüksek skoru tut
        ranked: Dict[str, int] = {}
        for url, score in candidates:
            if url not in ranked or score > ranked[url]:
                ranked[url] = score

        sorted_urls = sorted(
            ranked.items(),
            key=lambda item: (-item[1], len(item[0])),
        )

        return [url for url, _ in sorted_urls[:8]]

    def _try_fallback_paths(self, base_url: str, paths: List[str]) -> List[str]:
        """Yaygın iletişim sayfası yollarını deneyerek çalışanları döndür."""
        found = []
        parsed = urlparse(base_url)
        base = f"{parsed.scheme}://{parsed.netloc}"

        for path in paths:
            test_url = base + path
            try:
                with httpx.Client(
                    timeout=5,
                    follow_redirects=True,
                    verify=False,
                    headers=self.headers,
                ) as client:
                    resp = client.head(test_url)
                    if resp.status_code == 200:
                        found.append(test_url)
                        if len(found) >= 2:
                            break
            except Exception:
                continue

        return found

    # ── Yardımcı Metodlar ────────────────────────────────

    def _fetch_page(
        self, url: str
    ) -> Tuple[Optional[str], Optional[BeautifulSoup]]:
        """Bir sayfayı getir, (html_text, soup) döndür."""
        try:
            with httpx.Client(
                timeout=self.timeout,
                follow_redirects=True,
                verify=False,
                headers=self.headers,
            ) as client:
                response = client.get(url)
                response.raise_for_status()

                content_type = response.headers.get("content-type", "")
                if (
                    "text/html" not in content_type
                    and "application/xhtml" not in content_type
                ):
                    return None, None

                html = response.text
                soup = BeautifulSoup(html, "html.parser")
                return html, soup

        except Exception as e:
            logger.debug(f"Sayfa getirilemedi {url}: {e}")
            return None, None

    def _extract_domain(self, url: str) -> Optional[str]:
        """URL'den domain çıkar."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
            return domain if domain else None
        except Exception:
            return None

    def _extract_company_name(
        self, soup: BeautifulSoup, url: str
    ) -> Optional[str]:
        """Farklı kaynaklardan firma adını çıkar."""
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            name = og_title["content"].strip()
            if 2 < len(name) < 200:
                return name

        title_tag = soup.find("title")
        if title_tag and title_tag.string:
            title = title_tag.string.strip()
            for sep in [' | ', ' - ', ' – ', ' — ', ' :: ', ' » ', ' / ']:
                if sep in title:
                    title = title.split(sep)[0].strip()
            if 2 < len(title) < 200:
                return title

        h1 = soup.find("h1")
        if h1 and h1.get_text(strip=True):
            name = h1.get_text(strip=True)
            if 2 < len(name) < 200:
                return name

        domain = self._extract_domain(url)
        if domain:
            return domain.split('.')[0].title()

        return None

    def _extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Meta etiketlerinden firma açıklaması çıkar."""
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            return meta_desc["content"].strip()[:500]

        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            return og_desc["content"].strip()[:500]

        return None

    def _find_page_by_patterns(
        self,
        soup: BeautifulSoup,
        base_url: str,
        url_patterns: List[str],
        text_keywords: List[str],
    ) -> Optional[str]:
        """Verilen kalıplara göre ilgili sayfayı bul."""
        for a in soup.find_all("a", href=True):
            href = a["href"].lower()
            text = a.get_text(strip=True).lower()

            for pattern in url_patterns:
                if re.search(pattern, href, re.I):
                    return urljoin(base_url, a["href"])

            if any(kw in text for kw in text_keywords):
                return urljoin(base_url, a["href"])

        return None

    def _extract_address(self, soup: BeautifulSoup) -> Optional[str]:
        """Fiziksel adresi çıkarmaya çalış."""
        addr = soup.find("address")
        if addr:
            text = addr.get_text(strip=True)
            if len(text) > 10:
                return text[:500]

        for selector in [
            {"class_": re.compile(r"address|adres|location|konum", re.I)},
            {"id": re.compile(r"address|adres|location|konum", re.I)},
        ]:
            elem = soup.find(["div", "p", "span"], **selector)
            if elem:
                text = elem.get_text(strip=True)
                if 10 < len(text) < 500:
                    return text

        return None

    def _generate_common_emails(self, domain: str) -> List[str]:
        """Yaygın e-posta adreslerini oluştur."""
        common = ["info", "contact", "sales"]
        return [f"{prefix}@{domain}" for prefix in common]


# Singleton instance
scraper = WebsiteScraper()

