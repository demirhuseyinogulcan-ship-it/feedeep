"""
feedeep Web Scraper - Google Maps Crawler
Playwright ile Google Maps'ten firma bilgilerini çıkarır.
Firma adı, web sitesi, telefon → sonra web sitesini kazıyarak email çıkarır.
"""
import re
import os
import time
import json
import random
import logging
import threading
from pathlib import Path
from typing import List, Dict, Optional, Callable
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from email_extractor import extract_emails_from_html, extract_phones_from_html, extract_person_details
from website_scraper import WebsiteScraper
from config import settings

logger = logging.getLogger(__name__)

BROWSER_PROFILE_DIR = str(Path(__file__).parent / "browser_profile")

# Maps'ten gelen sosyal medya linklerini filtrele
SOCIAL_MEDIA_DOMAINS = {
    "instagram.com", "facebook.com", "twitter.com", "x.com",
    "linkedin.com", "youtube.com", "tiktok.com", "pinterest.com",
}


class GoogleMapsCrawler:
    """
    Google Maps'te arama yaparak firma bilgilerini çıkarır.
    Playwright Chromium ile çalışır — scroll, kart tıklama, web sitesi zenginleştirme.
    """

    _lock = threading.Lock()

    def search(
        self,
        query: str,
        max_results: int = 50,
        lang: str = "tr",
        region: str = None,
    ) -> List[Dict]:
        """
        Google Maps'te arama yap ve firma bilgilerini döndür.
        Her firma: name, website, phone, emails, address, source, contact_person, contact_title
        """
        from playwright.sync_api import sync_playwright

        search_query = query
        if region:
            search_query = f"{query} {region}"

        results = []

        with GoogleMapsCrawler._lock:
            with sync_playwright() as pw:
                browser = pw.chromium.launch(
                    headless=True,
                    args=[
                        "--disable-blink-features=AutomationControlled",
                        "--no-sandbox",
                        "--disable-dev-shm-usage",
                    ],
                )

                context = browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/122.0.0.0 Safari/537.36"
                    ),
                    viewport={"width": 1366, "height": 768},
                    locale="tr-TR",
                    timezone_id="Europe/Istanbul",
                )

                context.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', { get: () => false });
                    window.chrome = { runtime: {} };
                """)

                page = context.new_page()

                try:
                    # Google Maps arama URL'si
                    encoded = quote_plus(search_query)
                    maps_url = f"https://www.google.com/maps/search/{encoded}/@?hl={lang}"

                    logger.info(f"Google Maps araması: {search_query}")
                    logger.info(f"URL: {maps_url}")

                    page.goto(maps_url, wait_until="domcontentloaded", timeout=30000)
                    time.sleep(3)

                    # CAPTCHA kontrolü
                    if self._check_captcha(page):
                        logger.warning("Google Maps CAPTCHA algılandı!")
                        # Headed mode ile tekrar dene
                        context.close()
                        browser.close()

                        browser = pw.chromium.launch(
                            headless=False,
                            args=["--disable-blink-features=AutomationControlled"],
                        )
                        context = browser.new_context(
                            user_agent=(
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                "AppleWebKit/537.36 (KHTML, like Gecko) "
                                "Chrome/122.0.0.0 Safari/537.36"
                            ),
                            locale="tr-TR",
                        )
                        context.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => false });")
                        page = context.new_page()
                        page.goto(maps_url, wait_until="domcontentloaded", timeout=60000)

                        # Kullanıcının CAPTCHA çözmesini bekle
                        logger.info("CAPTCHA çözümü bekleniyor (120 sn)...")
                        for i in range(120):
                            time.sleep(1)
                            if not self._check_captcha(page):
                                logger.info("CAPTCHA çözüldü!")
                                break
                        time.sleep(3)

                    # Sonuç panelini bekle
                    try:
                        page.wait_for_selector('div[role="feed"]', timeout=10000)
                    except Exception:
                        logger.warning("Sonuç paneli bulunamadı, devam ediliyor...")
                        time.sleep(3)

                    # Scroll ile daha fazla sonuç yükle
                    self._scroll_results(page, max_results)

                    # Firma kartlarını çıkar
                    businesses = self._extract_businesses(page)
                    logger.info(f"Google Maps'te {len(businesses)} işletme bulundu")

                    # Limitle
                    businesses = businesses[:max_results]

                    # Her firmayı zenginleştir (web sitesinden email çek)
                    scraper = WebsiteScraper()
                    for idx, biz in enumerate(businesses):
                        logger.info(
                            f"  Maps [{idx+1}/{len(businesses)}] {biz['name']}"
                        )

                        result = {
                            "name": biz["name"],
                            "website": biz.get("website", ""),
                            "domain": "",
                            "emails": [],
                            "phones": [],
                            "address": biz.get("address", ""),
                            "description": "",
                            "source": "Google Maps",
                            "contact_person": None,
                            "contact_title": None,
                            "email_variants": {},
                            "google_title": biz["name"],
                            "google_snippet": biz.get("category", ""),
                        }

                        # Maps'ten gelen telefon
                        if biz.get("phone"):
                            result["phones"] = [biz["phone"]]

                        # Web sitesi varsa kazı (sosyal medya hariç)
                        website = biz.get("website")
                        is_social = False
                        if website:
                            try:
                                from urllib.parse import urlparse
                                parsed_domain = urlparse(website).netloc.replace("www.", "").lower()
                                is_social = parsed_domain in SOCIAL_MEDIA_DOMAINS
                            except Exception:
                                pass

                        if website and website.startswith("http") and not is_social:
                            try:
                                scraped = scraper.scrape(website)
                                result["website"] = website
                                result["domain"] = scraped.get("domain", "")
                                result["description"] = scraped.get("description", "")
                                result["contact_person"] = scraped.get("contact_person")
                                result["contact_title"] = scraped.get("contact_title")
                                result["email_variants"] = scraped.get("email_variants", {})

                                # Email'leri birleştir
                                scraped_emails = scraped.get("emails", [])
                                if scraped_emails:
                                    result["emails"] = scraped_emails

                                # Telefonları birleştir
                                scraped_phones = scraped.get("phones", [])
                                existing_phones = set(result["phones"])
                                for p in scraped_phones:
                                    if p not in existing_phones:
                                        result["phones"].append(p)

                            except Exception as e:
                                logger.debug(f"  Web kazıma hatası: {e}")

                        results.append(result)
                        time.sleep(0.5)  # Rate limiting

                except Exception as e:
                    logger.error(f"Google Maps arama hatası: {e}")
                finally:
                    context.close()
                    browser.close()

        logger.info(f"Google Maps toplam {len(results)} firma bulundu")
        return results

    def _check_captcha(self, page) -> bool:
        """CAPTCHA sayfası mı kontrol et."""
        try:
            url = page.url
            if "/sorry/" in url or "captcha" in url.lower():
                return True
            content = page.content().lower()
            return "captcha" in content or "recaptcha" in content
        except Exception:
            return False

    def _scroll_results(self, page, max_results: int):
        """Sonuç panelini scroll ederek daha fazla firma yükle."""
        try:
            feed = page.query_selector('div[role="feed"]')
            if not feed:
                logger.warning("Scroll paneli bulunamadı")
                return

            last_height = 0
            max_scrolls = max(5, max_results // 8)
            scroll_count = 0

            for _ in range(max_scrolls):
                page.evaluate(
                    """(feed) => { feed.scrollTop = feed.scrollHeight; }""",
                    feed,
                )
                time.sleep(1.5 + random.uniform(0.5, 1.5))

                new_height = page.evaluate(
                    "(feed) => feed.scrollHeight", feed
                )

                if new_height == last_height:
                    # Listenin sonu
                    break

                last_height = new_height
                scroll_count += 1

                # Yeterli sonuç varsa dur
                cards = page.query_selector_all('div[role="article"]')
                if len(cards) >= max_results:
                    break

            logger.info(f"  {scroll_count} scroll yapıldı")

        except Exception as e:
            logger.warning(f"Scroll hatası: {e}")

    def _extract_businesses(self, page) -> List[Dict]:
        """Google Maps sonuç kartlarından firma bilgilerini çıkar."""
        businesses = []
        seen_names = set()

        try:
            # Firma kartlarını bul
            selectors = [
                'div[role="article"]',
                'a[href*="/maps/place/"]',
            ]

            for selector in selectors:
                cards = page.query_selector_all(selector)
                if not cards:
                    continue

                logger.info(f"  '{selector}' ile {len(cards)} kart bulundu")

                for card in cards:
                    try:
                        biz = self._extract_single_business(page, card)
                        if biz and biz["name"] not in seen_names:
                            seen_names.add(biz["name"])
                            businesses.append(biz)
                    except Exception as e:
                        logger.debug(f"  Kart çıkarma hatası: {e}")
                        continue

                if businesses:
                    break  # İlk çalışan seçiciyi kullan

        except Exception as e:
            logger.error(f"Firma çıkarma hatası: {e}")

        return businesses

    def _extract_single_business(self, page, card) -> Optional[Dict]:
        """Tek bir firma kartından bilgi çıkar."""
        # Firma adı
        name_elem = card.query_selector('div.fontHeadlineSmall')
        if not name_elem:
            # Alternatif seçiciler
            name_elem = card.query_selector('[class*="fontHeadlineSmall"]')
        if not name_elem:
            name_elem = card.query_selector('span.fontHeadlineSmall')

        if not name_elem:
            return None

        name = name_elem.inner_text().strip()
        if not name or len(name) < 2:
            return None

        result = {"name": name, "website": None, "phone": None, "address": None, "category": None}

        # Kartı tıkla — detayları aç
        try:
            card.click()
            time.sleep(1.0)

            # Web sitesi
            try:
                website_btn = page.query_selector('a[data-item-id="authority"]')
                if website_btn:
                    result["website"] = website_btn.get_attribute("href")
            except Exception:
                pass

            # Telefon
            try:
                phone_btns = page.query_selector_all('button[data-item-id^="phone"]')
                if phone_btns:
                    aria = phone_btns[0].get_attribute("aria-label")
                    if aria:
                        phone_match = re.search(r'[\d\s\+\-\(\)]+', aria)
                        if phone_match:
                            phone = re.sub(r'[\s\-\(\)]', '', phone_match.group().strip())
                            if len(phone) >= 10:
                                result["phone"] = phone
            except Exception:
                pass

            # Adres
            try:
                addr_btn = page.query_selector('button[data-item-id="address"]')
                if addr_btn:
                    aria = addr_btn.get_attribute("aria-label")
                    if aria:
                        # "Adres: ..." formatını temizle
                        result["address"] = re.sub(r'^(Adres|Address):\s*', '', aria).strip()
            except Exception:
                pass

            # Kategori
            try:
                cat_btns = page.query_selector_all('button[jsaction*="category"]')
                if cat_btns:
                    result["category"] = cat_btns[0].inner_text().strip()
            except Exception:
                pass

        except Exception as e:
            logger.debug(f"  Kart tıklama hatası ({name}): {e}")

        return result


# Singleton
maps_crawler = GoogleMapsCrawler()

