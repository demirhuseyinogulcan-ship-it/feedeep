"""
feedeep Web Scraper - Arama Motoru Entegrasyonu
Google arama sonuçlarını getirir. Stratejiler:
  1. Google Playwright (gerçek tarayıcı ile arama - ana motor)
  2. DuckDuckGo HTML kazıma (yedek motor)
  3. Bing HTML kazıma (ikinci yedek)
  4. SerpAPI (ücretli, production için - opsiyonel)
"""
import re
import os
import time
import random
import logging
import threading
from pathlib import Path
from urllib.parse import quote_plus, urlparse, parse_qs, unquote
from typing import List, Optional

import httpx
from bs4 import BeautifulSoup

from config import settings

logger = logging.getLogger(__name__)

# ── Playwright tarayıcı profil dizini (cookie'ler burada saklanır) ──
BROWSER_PROFILE_DIR = str(Path(__file__).parent / "browser_profile")


class SearchResult:
    """Bir arama sonucunu temsil eder."""

    def __init__(self, url: str, title: str = "", snippet: str = ""):
        self.url = url
        self.title = title
        self.snippet = snippet

    def to_dict(self):
        return {
            "url": self.url,
            "title": self.title,
            "snippet": self.snippet,
        }


# ── Tarayıcı başlıkları havuzu ──────────────────────────
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]


def _get_headers():
    """Rastgele User-Agent ile başlıklar oluştur."""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }


def _clean_google_url(url: str) -> Optional[str]:
    """Google yönlendirme URL'sinden gerçek URL'yi çıkar."""
    if not url:
        return None
    if url.startswith("/url?"):
        parsed = parse_qs(urlparse(url).query)
        if "q" in parsed:
            return parsed["q"][0]
        if "url" in parsed:
            return parsed["url"][0]
    if url.startswith("http") and "google.com" not in url:
        return url
    return None


class GooglePlaywrightSearchEngine:
    """
    Google arama - Playwright gerçek tarayıcı ile.
    CAPTCHA gelirse tarayıcıyı görünür açar, kullanıcı çözer.
    Cookie'ler kaydedilir, sonraki aramalarda CAPTCHA gerekmez.
    """

    _lock = threading.Lock()

    def search(
        self,
        query: str,
        num_results: int = 30,
        lang: str = "tr",
        region: str = None,
    ) -> List[SearchResult]:
        """Google Playwright araması - ana motor."""
        from playwright.sync_api import sync_playwright

        results = []
        search_query = query
        if region:
            search_query = f"{query} {region}"

        pages_needed = max(1, (num_results + 9) // 10)

        with GooglePlaywrightSearchEngine._lock:
            with sync_playwright() as pw:
                # Önce headless dene
                context, browser, is_headed = self._get_browser_context(pw, headless=True)
                try:
                    page = context.new_page()

                    for page_num in range(pages_needed):
                        start = page_num * 10
                        page_results = self._fetch_google_page(
                            pw, page, context, browser, search_query, start, lang
                        )
                        results.extend(page_results)

                        logger.info(
                            f"  Google Playwright sayfa {page_num+1}: "
                            f"{len(page_results)} sonuç"
                        )

                        if len(page_results) == 0:
                            break
                        if len(results) >= num_results:
                            break

                        # Sayfalar arası doğal bekleme
                        time.sleep(random.uniform(2.0, 4.0))

                finally:
                    context.close()
                    browser.close()

        results = results[:num_results]
        logger.info(
            f"Google Playwright toplam {len(results)} sonuç: {search_query}"
        )
        return results

    def _get_browser_context(self, pw, headless=True):
        """Tarayıcı context oluştur - profil dizininden cookie'leri yükler."""
        os.makedirs(BROWSER_PROFILE_DIR, exist_ok=True)

        browser = pw.chromium.launch(
            headless=headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
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
            java_script_enabled=True,
            extra_http_headers={
                "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
            },
        )

        # Kayıtlı cookie'leri yükle
        cookie_file = Path(BROWSER_PROFILE_DIR) / "google_cookies.json"
        if cookie_file.exists():
            import json
            try:
                with open(cookie_file, "r") as f:
                    cookies = json.loads(f.read())
                if cookies:
                    context.add_cookies(cookies)
                    logger.info(f"  {len(cookies)} kayıtlı cookie yüklendi")
            except Exception as e:
                logger.warning(f"  Cookie yükleme hatası: {e}")

        # Stealth: navigator.webdriver = false
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en-US', 'en'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            window.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
            delete navigator.__proto__.webdriver;
        """)

        return context, browser, not headless

    def _save_cookies(self, context):
        """Tarayıcı cookie'lerini kaydet."""
        import json
        try:
            cookies = context.cookies()
            cookie_file = Path(BROWSER_PROFILE_DIR) / "google_cookies.json"
            with open(cookie_file, "w") as f:
                f.write(json.dumps(cookies, indent=2))
            logger.info(f"  {len(cookies)} cookie kaydedildi")
        except Exception as e:
            logger.warning(f"  Cookie kaydetme hatası: {e}")

    def _is_captcha_page(self, page) -> bool:
        """Sayfanın CAPTCHA/sorry sayfası olup olmadığını kontrol et."""
        current_url = page.url
        if "/sorry/" in current_url or "sorry/index" in current_url:
            return True
        if "recaptcha" in current_url:
            return True
        # İçerik kontrolü
        try:
            content = page.content()
            if "unusual traffic" in content.lower() or "olağandışı trafik" in content.lower():
                return True
        except:
            pass
        return False

    def _handle_captcha(self, pw, page, old_context, old_browser, url: str):
        """
        CAPTCHA algılandığında:
        1. Eski headless tarayıcıyı kapat
        2. Görünür tarayıcı aç
        3. Kullanıcının CAPTCHA'yı çözmesini bekle
        4. Cookie'leri kaydet
        5. Yeni headless context döndür
        """
        logger.warning("=" * 60)
        logger.warning("  CAPTCHA ALGILANDI!")
        logger.warning("  Tarayıcı penceresi açılıyor...")
        logger.warning("  Lütfen CAPTCHA'yı çözün ve arama sayfasının yüklenmesini bekleyin.")
        logger.warning("=" * 60)

        # Eski headless'ı kapat
        try:
            old_context.close()
            old_browser.close()
        except:
            pass

        # Görünür tarayıcı aç
        browser = pw.chromium.launch(
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--start-maximized",
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
            extra_http_headers={
                "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
            },
        )

        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en-US', 'en'] });
            window.chrome = { runtime: {} };
            delete navigator.__proto__.webdriver;
        """)

        new_page = context.new_page()
        new_page.goto(url, wait_until="domcontentloaded", timeout=60000)

        # Kullanıcının CAPTCHA'yı çözmesini bekle (max 120 saniye)
        logger.info("  CAPTCHA çözümü bekleniyor (max 120 saniye)...")
        for i in range(120):
            time.sleep(1)
            current_url = new_page.url
            if "/sorry/" not in current_url and "sorry/index" not in current_url:
                # CAPTCHA çözüldü!
                logger.info("  CAPTCHA ÇÖZÜLDÜ! Devam ediliyor...")
                time.sleep(2)  # Sayfanın tam yüklenmesini bekle
                break
            if i % 10 == 0 and i > 0:
                logger.info(f"  Hala bekleniyor... ({i} saniye)")
        else:
            logger.warning("  CAPTCHA zaman aşımı! (120 saniye)")

        # Cookie'leri kaydet
        self._save_cookies(context)

        return new_page, context, browser

    def _fetch_google_page(
        self, pw, page, context, browser, query: str, start: int, lang: str
    ) -> List[SearchResult]:
        """Tek bir Google arama sayfasını Playwright ile getir."""
        encoded_query = quote_plus(query)

        url = (
            f"https://www.google.com.tr/search?"
            f"q={encoded_query}&start={start}&num=10"
            f"&hl={lang}"
        )

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(random.uniform(1.0, 2.0))

            # CAPTCHA kontrolü
            if self._is_captcha_page(page):
                page, context, browser = self._handle_captcha(
                    pw, page, context, browser, url
                )

            # Sonuçların yüklenmesini bekle
            try:
                page.wait_for_selector("div#search", timeout=10000)
            except:
                # Alternatif seçici dene
                try:
                    page.wait_for_selector("div.g", timeout=5000)
                except:
                    pass

            # HTML'i al ve ayrıştır
            html = page.content()
            results = self._parse_google_html(html)

            # Başarılıysa cookie'leri güncelle
            if results:
                self._save_cookies(context)

            return results

        except Exception as e:
            logger.warning(f"  Google Playwright sayfa hatası: {e}")
            return []

    def _parse_google_html(self, html: str) -> List[SearchResult]:
        """Google HTML'ini ayrıştırarak arama sonuçlarını çıkar."""
        soup = BeautifulSoup(html, "html.parser")
        results = []

        # Yöntem 1: Standard organik sonuçlar (div.g)
        for g in soup.select("div.g"):
            link = g.find("a", href=True)
            if not link:
                continue

            url = link["href"]
            if not url or not url.startswith("http"):
                cleaned = _clean_google_url(url)
                if cleaned:
                    url = cleaned
                else:
                    continue
            if "google.com" in url or "google.com.tr" in url:
                continue

            title_elem = g.find("h3")
            title = title_elem.get_text(strip=True) if title_elem else ""

            snippet_elem = (
                g.find("div", class_="VwiC3b") or
                g.find("span", class_="aCOpRe") or
                g.find("div", {"data-sncf": True}) or
                g.select_one("div.IsZvec") or
                g.find("div", class_=re.compile(r"^[a-zA-Z0-9]+$"))
            )
            snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""

            results.append(SearchResult(url=url, title=title, snippet=snippet))

        # Yöntem 2: h3 etiketlerinden URL çıkar
        if len(results) == 0:
            for h3 in soup.find_all("h3"):
                parent_a = h3.find_parent("a", href=True)
                if parent_a:
                    url = parent_a["href"]
                    if url.startswith("http") and "google" not in url:
                        title = h3.get_text(strip=True)
                        results.append(SearchResult(url=url, title=title))

        # Yöntem 3: Fallback - tüm bağlantılardan URL çıkar
        if len(results) == 0:
            seen = set()
            for a in soup.find_all("a", href=True):
                href = a["href"]
                url = _clean_google_url(href)
                if not url:
                    if href.startswith("http") and "google" not in href:
                        url = href
                    else:
                        continue

                domain = urlparse(url).netloc
                if domain in seen:
                    continue
                if not domain or "google" in domain:
                    continue

                seen.add(domain)
                title = a.get_text(strip=True) or ""
                results.append(SearchResult(url=url, title=title))

        return results


class DuckDuckGoSearchEngine:
    """
    DuckDuckGo HTML arama - Google başarısız olursa yedek motor.
    DuckDuckGo daha az agresif bot tespiti uygular.
    """

    def search(
        self,
        query: str,
        num_results: int = 30,
        lang: str = "tr",
        region: str = None,
    ) -> List[SearchResult]:
        """DuckDuckGo HTML araması."""
        results = []
        search_query = query
        if region:
            search_query = f"{query} {region}"

        try:
            encoded = quote_plus(search_query)
            url = f"https://html.duckduckgo.com/html/?q={encoded}"

            with httpx.Client(
                timeout=20,
                follow_redirects=True,
                verify=False,
                headers=_get_headers(),
            ) as client:
                response = client.get(url)
                if response.status_code != 200:
                    logger.warning(f"DuckDuckGo HTTP {response.status_code}")
                    return results

                soup = BeautifulSoup(response.text, "html.parser")

                for r in soup.select("div.result"):
                    link = r.find("a", class_="result__a", href=True)
                    if not link:
                        continue

                    raw_url = link["href"]
                    # DuckDuckGo redirect URL'sini çöz
                    if "uddg=" in raw_url:
                        parsed = parse_qs(urlparse(raw_url).query)
                        actual_url = parsed.get("uddg", [None])[0]
                        if actual_url:
                            raw_url = unquote(actual_url)

                    if not raw_url or not raw_url.startswith("http"):
                        continue

                    title = link.get_text(strip=True) or ""

                    snippet_elem = r.find("a", class_="result__snippet")
                    snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""

                    results.append(
                        SearchResult(url=raw_url, title=title, snippet=snippet)
                    )

                    if len(results) >= num_results:
                        break

            logger.info(f"DuckDuckGo {len(results)} sonuç döndürdü: {search_query}")

        except Exception as e:
            logger.error(f"DuckDuckGo arama başarısız: {e}")

        return results


class BingSearchEngine:
    """
    Bing HTML arama - ek yedek motor.
    """

    def search(
        self,
        query: str,
        num_results: int = 30,
        lang: str = "tr",
        region: str = None,
    ) -> List[SearchResult]:
        """Bing HTML araması."""
        results = []
        search_query = query
        if region:
            search_query = f"{query} {region}"

        pages_needed = max(1, (num_results + 9) // 10)

        for page in range(pages_needed):
            first = page * 10 + 1
            try:
                encoded = quote_plus(search_query)
                url = f"https://www.bing.com/search?q={encoded}&first={first}&setlang={lang}"

                with httpx.Client(
                    timeout=20,
                    follow_redirects=True,
                    verify=False,
                    headers=_get_headers(),
                ) as client:
                    response = client.get(url)
                    if response.status_code != 200:
                        break

                    soup = BeautifulSoup(response.text, "html.parser")

                    page_count = 0
                    for li in soup.select("li.b_algo"):
                        link = li.find("a", href=True)
                        if not link:
                            continue

                        link_url = link["href"]
                        # Bing yönlendirme URL'lerini çöz
                        if "bing.com/ck/a" in link_url:
                            cite = li.find("cite")
                            if cite:
                                cite_text = cite.get_text(strip=True)
                                if cite_text.startswith("http"):
                                    link_url = cite_text.split(" ")[0]
                                else:
                                    link_url = "https://" + cite_text.split(" ")[0]
                            else:
                                continue

                        if not link_url.startswith("http"):
                            continue

                        # Google/Bing kendi domainlerini atla
                        parsed_domain = urlparse(link_url).netloc.lower()
                        if any(skip in parsed_domain for skip in ["bing.com", "microsoft.com", "google.com"]):
                            continue

                        title = link.get_text(strip=True) or ""
                        snippet_elem = li.find("p") or li.find("div", class_="b_caption")
                        snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""

                        results.append(
                            SearchResult(url=link_url, title=title, snippet=snippet)
                        )
                        page_count += 1

                    if page_count == 0:
                        break

                    if len(results) >= num_results:
                        break

                    time.sleep(random.uniform(1.0, 2.0))

            except Exception as e:
                logger.warning(f"Bing sayfa {page+1} başarısız: {e}")
                break

        results = results[:num_results]
        logger.info(f"Bing {len(results)} sonuç döndürdü: {search_query}")
        return results


class SerpAPISearchEngine:
    """SerpAPI (ücretli, opsiyonel)."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    def search(
        self,
        query: str,
        num_results: int = 30,
        lang: str = "tr",
        region: str = None,
    ) -> List[SearchResult]:
        """SerpAPI araması."""
        try:
            params = {
                "q": query,
                "api_key": self.api_key,
                "num": min(num_results, 100),
                "hl": lang,
                "engine": "google",
            }
            if region:
                region_map = {
                    "türkiye": "tr", "turkey": "tr",
                    "almanya": "de", "germany": "de",
                    "amerika": "us", "usa": "us",
                    "ingiltere": "gb", "uk": "gb",
                    "fransa": "fr", "france": "fr",
                }
                gl = region_map.get(region.lower(), region.lower()[:2])
                params["gl"] = gl

            response = httpx.get(
                "https://serpapi.com/search", params=params, timeout=30
            )
            response.raise_for_status()
            data = response.json()

            results = []
            for item in data.get("organic_results", []):
                results.append(
                    SearchResult(
                        url=item.get("link", ""),
                        title=item.get("title", ""),
                        snippet=item.get("snippet", ""),
                    )
                )
            for item in data.get("local_results", {}).get("places", []):
                if item.get("website"):
                    results.append(
                        SearchResult(
                            url=item.get("website", ""),
                            title=item.get("title", ""),
                            snippet=item.get("address", ""),
                        )
                    )

            logger.info(f"SerpAPI {len(results)} sonuç: {query}")
            return results

        except Exception as e:
            logger.error(f"SerpAPI başarısız: {e}")
            raise


class MultiSearchEngine:
    """
    Birden fazla arama motorunu sırayla dener.
    Google Playwright ana motor, DuckDuckGo ve Bing yedek.
    """

    def __init__(self):
        self.engines = [
            ("Google", GooglePlaywrightSearchEngine()),
            ("DuckDuckGo", DuckDuckGoSearchEngine()),
            ("Bing", BingSearchEngine()),
        ]

    def search(
        self,
        query: str,
        num_results: int = 30,
        lang: str = "tr",
        region: str = None,
    ) -> List[SearchResult]:
        """Sırayla motorları dene, ilk başarılı sonucu döndür."""
        for name, engine in self.engines:
            try:
                logger.info(f"  {name} motoru deneniyor...")
                results = engine.search(
                    query=query,
                    num_results=num_results,
                    lang=lang,
                    region=region,
                )
                if results:
                    logger.info(f"  ✓ {name} başarılı: {len(results)} sonuç")
                    return results
                else:
                    logger.warning(f"  ✗ {name}: 0 sonuç, sonraki motor deneniyor...")
            except Exception as e:
                logger.warning(f"  ✗ {name} başarısız: {e}")
                continue

        logger.error("Tüm arama motorları başarısız oldu!")
        return []


def get_search_engine():
    """Yapılandırmaya göre uygun arama motorunu seç."""
    if settings.SERPAPI_KEY:
        logger.info("SerpAPI motoru kullanılıyor")
        return SerpAPISearchEngine(settings.SERPAPI_KEY)
    logger.info("Çoklu arama motoru: Google (Playwright) → DuckDuckGo → Bing")
    return MultiSearchEngine()

