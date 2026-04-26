"""
feedeep Web Scraper - Gelişmiş E-posta ve Telefon Çıkarma Motoru
7 katmanlı e-posta çıkarma: regex, JSON-LD, mailto, data-attr, obfuscated, script, CSS hedef.
Kişi adı + ünvan çıkarma. Email türev üretimi (satinalma@, uretim@ vb.)
"""
import json
import re
from html import unescape
from urllib.parse import unquote
from typing import List, Set, Dict, Optional, Tuple

from bs4 import BeautifulSoup


# ══════════════════════════════════════════════════════════
# REGEX KALIPLARİ
# ══════════════════════════════════════════════════════════

EMAIL_PATTERN = re.compile(
    r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b',
    re.IGNORECASE,
)

# Obfuscated email kalıpları (gizlenmiş e-postalar)
OBFUSCATED_EMAIL_PATTERNS = [
    # info [at] domain [dot] com
    re.compile(
        r'([A-Za-z0-9._%+-]+)\s*(?:\(|\[)?at(?:\]|\))?\s*'
        r'([A-Za-z0-9.-]+)\s*(?:\(|\[)?dot(?:\]|\))?\s*([A-Za-z]{2,})',
        re.IGNORECASE,
    ),
    # info(at)domain.com  /  info [at] domain.com
    re.compile(
        r'([A-Za-z0-9._%+-]+)\s*(?:\[at\]|\(at\)|\sat\s)\s*'
        r'([A-Za-z0-9.-]+\.[A-Za-z]{2,})',
        re.IGNORECASE,
    ),
    # JavaScript: 'user' + '@' + 'domain.com'
    re.compile(
        r"['\"]([A-Za-z0-9._%+-]+)['\"]\s*\+\s*['\"]@['\"]\s*\+\s*"
        r"['\"]([A-Za-z0-9.-]+\.[A-Za-z]{2,})['\"]",
        re.IGNORECASE,
    ),
    # HTML entity: info&#64;domain.com
    re.compile(
        r'([A-Za-z0-9._%+-]+)&#64;([A-Za-z0-9.-]+\.[A-Za-z]{2,})',
        re.IGNORECASE,
    ),
]

# Telefon kalıpları
PHONE_PATTERNS = [
    # +90 (XXX) XXX XX XX
    re.compile(
        r'\+90\s*[\(\-]?\s*\d{3}\s*[\)\-]?\s*\d{3}\s*[\-]?\s*\d{2}\s*[\-]?\s*\d{2}'
    ),
    # 0 (XXX) XXX XX XX
    re.compile(
        r'0\s*[\(\-]?\s*\d{3}\s*[\)\-]?\s*\d{3}\s*[\-]?\s*\d{2}\s*[\-]?\s*\d{2}'
    ),
    # (XXX) XXX XX XX
    re.compile(r'\(\d{3}\)\s*\d{3}\s*[\-]?\s*\d{2}\s*[\-]?\s*\d{2}'),
    # Uluslararası
    re.compile(
        r'\+\d{1,3}\s*[\(\-]?\s*\d{2,4}\s*[\)\-]?\s*\d{3,4}\s*[\-]?\s*\d{2,4}'
    ),
]

# Türk 444 kısa numaralar
PHONE_444_PATTERN = re.compile(r'\b444\s*\d\s*\d{3}\b|\b444\s*\d{2}\s*\d{2}\b')

# Kara liste e-posta domain'leri
EMAIL_BLACKLIST_DOMAINS = {
    'example.com', 'test.com', 'domain.com', 'email.com',
    'yoursite.com', 'yourdomain.com', 'sentry.io', 'placeholder.com',
    'wixpress.com', 'sentry-next.wixpress.com',
}

EMAIL_BLACKLIST_PREFIXES = {
    'noreply', 'no-reply', 'mailer-daemon', 'postmaster',
    'donotreply', 'do-not-reply', 'wordpress', 'woocommerce',
}

# E-posta olmayan dosya uzantıları
EXCLUDED_EMAIL_EXTENSIONS = re.compile(
    r'.*\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2|ttf|eot|map|webp|mp4|pdf)$',
    re.I,
)

# Öncelikli satış odaklı prefix'ler
PRIORITY_PREFIXES = [
    'info', 'contact', 'sales', 'satis', 'satinalma', 'export', 'import',
    'iletisim', 'bilgi', 'siparis', 'order', 'hello', 'hi',
    'support', 'destek', 'office', 'admin', 'general',
    'marketing', 'pazarlama', 'ihracat', 'ithalat',
    'uretim', 'production', 'purchasing', 'muhasebe',
]

# Hedef CSS seçiciler (email/telefon bulma olasılığı yüksek alanlar)
TARGET_CSS_SELECTORS = [
    ".elementor-icon-list-text",
    ".contact-info", ".contact-email", ".contact-phone",
    ".phone", ".email", ".tel",
    "footer", ".footer", "#footer", ".site-footer",
    ".contact-section", ".contact-details", ".contact-widget",
    ".wpb_text_column",  # WPBakery
    "[class*='contact']", "[class*='iletisim']",
    "[id*='contact']", "[id*='iletisim']",
]

# ══════════════════════════════════════════════════════════
# KİŞİ/ÜNVAN ÇIKARMA
# ══════════════════════════════════════════════════════════

TARGET_TITLES = {
    # Satın Alma
    "satın alma müdürü": "Satın Alma Müdürü",
    "satınalma müdürü": "Satın Alma Müdürü",
    "purchasing manager": "Satın Alma Müdürü",
    "satın alma uzmanı": "Satın Alma Uzmanı",
    "purchasing specialist": "Satın Alma Uzmanı",
    "satın alma sorumlusu": "Satın Alma Sorumlusu",
    # Yönetim
    "genel müdür": "Genel Müdür",
    "general manager": "Genel Müdür",
    "ceo": "CEO",
    "chief executive officer": "CEO",
    "fabrika müdürü": "Fabrika Müdürü",
    "plant manager": "Fabrika Müdürü",
    "direktör": "Direktör",
    "director": "Direktör",
    "müdür": "Müdür",
    "manager": "Müdür",
    "başkan": "Başkan",
    "president": "Başkan",
    "kurucu": "Kurucu",
    "founder": "Kurucu",
    "işletme müdürü": "İşletme Müdürü",
    "operations manager": "İşletme Müdürü",
    # Satış & Pazarlama
    "pazarlama müdürü": "Pazarlama Müdürü",
    "marketing manager": "Pazarlama Müdürü",
    "satış müdürü": "Satış Müdürü",
    "sales manager": "Satış Müdürü",
    "pazarlama uzmanı": "Pazarlama Uzmanı",
    "marketing specialist": "Pazarlama Uzmanı",
    "satış ve pazarlama müdürü": "Satış ve Pazarlama Müdürü",
    "sales and marketing manager": "Satış ve Pazarlama Müdürü",
    "iş geliştirme müdürü": "İş Geliştirme Müdürü",
    "business development manager": "İş Geliştirme Müdürü",
    # Üretim & Kalite
    "üretim müdürü": "Üretim Müdürü",
    "production manager": "Üretim Müdürü",
    "kalite müdürü": "Kalite Müdürü",
    "quality manager": "Kalite Müdürü",
    "kalite güvence müdürü": "Kalite Güvence Müdürü",
    "quality assurance manager": "Kalite Güvence Müdürü",
    "kalite kontrol müdürü": "Kalite Kontrol Müdürü",
    "quality control manager": "Kalite Kontrol Müdürü",
    # Teknik
    "teknik müdür": "Teknik Müdür",
    "technical manager": "Teknik Müdür",
    "cto": "CTO",
    "chief technology officer": "CTO",
    "ar-ge müdürü": "AR-GE Müdürü",
    "r&d manager": "AR-GE Müdürü",
}

# Email türev prefix'leri (satış için önemli departmanlar)
EMAIL_VARIANT_PREFIXES = [
    'satinalma', 'uretim', 'siparis', 'ihracat',
    'muhasebe', 'satis', 'pazarlama', 'info',
]


# ══════════════════════════════════════════════════════════
# EMAIL DOĞRULAMA
# ══════════════════════════════════════════════════════════

def _normalize_email(value: str) -> Optional[str]:
    """E-posta adresini normalize et — obfuscation çöz, doğrula."""
    if not value:
        return None

    candidate = unescape(value).strip()
    # Obfuscation çözümleme
    for old, new in [
        ("(at)", "@"), ("[at]", "@"), (" at ", "@"), ("{at}", "@"),
        ("(dot)", "."), ("[dot]", "."), (" dot ", "."), ("{dot}", "."),
        (" AT ", "@"), (" DOT ", "."),
        ("\\u0040", "@"), ("&#64;", "@"), ("&#x40;", "@"),
        ("%40", "@"), ("%2e", "."),
    ]:
        candidate = candidate.replace(old, new)

    candidate = candidate.strip("<>()[]{} \t\n\r")

    match = EMAIL_PATTERN.search(candidate)
    if not match:
        return None

    email = match.group(0).lower()
    local, domain = email.split("@", 1)

    # Kara liste kontrolleri
    if domain in EMAIL_BLACKLIST_DOMAINS:
        return None
    if local in EMAIL_BLACKLIST_PREFIXES:
        return None
    if EXCLUDED_EMAIL_EXTENSIONS.match(email):
        return None
    if len(local) < 2 or len(local) > 64:
        return None
    if '.' not in domain or len(domain) < 4:
        return None
    # Hash benzeri adresler (32 hex char)
    if re.match(r'^[a-f0-9]{32}$', local):
        return None

    return email


def _email_priority(email: str, domain: str = None) -> int:
    """Düşük skor = daha iyi. Sıralama önceliği."""
    score = 100
    local, email_domain = email.split('@')

    if domain and domain in email_domain:
        score -= 50

    for i, prefix in enumerate(PRIORITY_PREFIXES):
        if local.startswith(prefix):
            score -= (30 - i)
            break

    return score


# ══════════════════════════════════════════════════════════
# 7 KATMANLI EMAIL ÇIKARMA
# ══════════════════════════════════════════════════════════

def extract_emails_from_html(html: str, domain: str = None) -> List[str]:
    """
    HTML'den 7 katmanlı e-posta çıkarma:
    1. JSON-LD yapısal veri (Schema.org)
    2. Düz metin regex
    3. mailto: bağlantıları
    4. data-email attribute'ları
    5. Obfuscated (gizlenmiş) e-postalar
    6. Hedef CSS seçiciler (footer, contact-info vb.)
    7. <script> tag'leri içindeki e-postalar
    """
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    emails: Set[str] = set()

    # ── Katman 1: JSON-LD yapısal veri ──
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            items = data if isinstance(data, list) else [data]
            for item in items:
                if not isinstance(item, dict):
                    continue
                # Direkt email alanı
                if "email" in item:
                    val = item["email"]
                    if isinstance(val, str):
                        n = _normalize_email(val)
                        if n:
                            emails.add(n)
                    elif isinstance(val, list):
                        for v in val:
                            n = _normalize_email(str(v))
                            if n:
                                emails.add(n)
                # contactPoint içindeki email
                cp = item.get("contactPoint")
                if isinstance(cp, dict):
                    n = _normalize_email(cp.get("email", ""))
                    if n:
                        emails.add(n)
                elif isinstance(cp, list):
                    for c in cp:
                        if isinstance(c, dict):
                            n = _normalize_email(c.get("email", ""))
                            if n:
                                emails.add(n)
        except (json.JSONDecodeError, TypeError, KeyError):
            continue

    # ── Katman 2: Düz metin regex ──
    text = unescape(soup.get_text("\n"))
    for match in EMAIL_PATTERN.findall(text):
        n = _normalize_email(match)
        if n:
            emails.add(n)

    # ── Katman 3: mailto: bağlantıları ──
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if href.lower().startswith("mailto:"):
            raw = href[7:].split("?")[0]
            for piece in raw.replace(";", ",").split(","):
                n = _normalize_email(unquote(piece))
                if n:
                    emails.add(n)

    # ── Katman 4: data-email ve benzeri attribute'lar ──
    for elem in soup.find_all(True):
        for attr_name, attr_value in elem.attrs.items():
            if "email" not in attr_name.lower():
                continue
            vals = attr_value if isinstance(attr_value, list) else [attr_value]
            for v in vals:
                if isinstance(v, str):
                    n = _normalize_email(unescape(v))
                    if n:
                        emails.add(n)

    # ── Katman 5: Obfuscated (gizlenmiş) e-postalar ──
    for regex in OBFUSCATED_EMAIL_PATTERNS:
        for match in regex.findall(html):
            if isinstance(match, tuple):
                candidate = "".join(part for part in match if part)
                if "@" not in candidate:
                    # at/dot format — yeniden birleştir
                    if len(match) == 3:
                        candidate = f"{match[0]}@{match[1]}.{match[2]}"
                    elif len(match) == 2:
                        candidate = f"{match[0]}@{match[1]}"
            else:
                candidate = match
            n = _normalize_email(candidate)
            if n:
                emails.add(n)

    # ── Katman 6: Hedef CSS seçiciler ──
    for selector in TARGET_CSS_SELECTORS:
        try:
            for elem in soup.select(selector):
                elem_text = elem.get_text(" ", strip=True)
                for match in EMAIL_PATTERN.findall(elem_text):
                    n = _normalize_email(match)
                    if n:
                        emails.add(n)
        except Exception:
            continue

    # ── Katman 7: <script> tag'leri içindeki e-postalar ──
    script_texts = []
    for script in soup.find_all("script"):
        content = script.string or script.get_text()
        if content:
            script_texts.append(content)
    if script_texts:
        combined = unescape("\n".join(script_texts))
        # Obfuscated
        for regex in OBFUSCATED_EMAIL_PATTERNS:
            for match in regex.findall(combined):
                if isinstance(match, tuple):
                    candidate = "".join(part for part in match if part)
                    if "@" not in candidate and len(match) >= 2:
                        candidate = f"{match[0]}@{match[1]}" if len(match) == 2 else f"{match[0]}@{match[1]}.{match[2]}"
                else:
                    candidate = match
                n = _normalize_email(candidate)
                if n:
                    emails.add(n)
        # Normal regex
        for match in EMAIL_PATTERN.findall(combined):
            n = _normalize_email(match)
            if n:
                emails.add(n)

    # Sıralama
    result = sorted(emails, key=lambda e: _email_priority(e, domain))
    return result


def extract_emails(text: str, domain: str = None) -> List[str]:
    """
    Düz metin + basit HTML'den e-posta çıkar (geriye uyumluluk).
    Tam güç için extract_emails_from_html() kullanın.
    """
    if not text:
        return []

    found: Set[str] = set()
    for match in EMAIL_PATTERN.findall(text):
        n = _normalize_email(match)
        if n:
            found.add(n)

    # Obfuscated kontrol
    for regex in OBFUSCATED_EMAIL_PATTERNS:
        for match in regex.findall(text):
            if isinstance(match, tuple):
                candidate = "".join(part for part in match if part)
                if "@" not in candidate and len(match) >= 2:
                    candidate = f"{match[0]}@{match[1]}" if len(match) == 2 else f"{match[0]}@{match[1]}.{match[2]}"
            else:
                candidate = match
            n = _normalize_email(candidate)
            if n:
                found.add(n)

    return sorted(found, key=lambda e: _email_priority(e, domain))


# ══════════════════════════════════════════════════════════
# TELEFON ÇIKARMA (444 dahil)
# ══════════════════════════════════════════════════════════

def _normalize_phone(value: str) -> Optional[str]:
    """Telefon numarasını normalize et."""
    if not value:
        return None
    candidate = unescape(value).strip()
    digits = re.sub(r'[\s\-\(\)\.]+', '', candidate)
    if digits.startswith("00"):
        digits = "+" + digits[2:]
    elif digits.startswith("+00"):
        digits = "+" + digits[3:]
    if len(digits) < 7:  # 444 numaralarda 7 digit
        return None
    return digits


def extract_phones_from_html(html: str) -> List[str]:
    """
    HTML'den gelişmiş telefon çıkarma:
    - JSON-LD (Schema.org telephone)
    - Düz metin regex
    - tel: bağlantıları
    - Türk 444 XX XX kısa numaraları
    - Hedef CSS seçiciler
    """
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    phones: Set[str] = set()

    # ── JSON-LD telephone ──
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            items = data if isinstance(data, list) else [data]
            for item in items:
                if not isinstance(item, dict):
                    continue
                if "telephone" in item:
                    val = item["telephone"]
                    if isinstance(val, str):
                        n = _normalize_phone(val)
                        if n:
                            phones.add(n)
                    elif isinstance(val, list):
                        for v in val:
                            n = _normalize_phone(str(v))
                            if n:
                                phones.add(n)
                cp = item.get("contactPoint")
                if isinstance(cp, dict) and "telephone" in cp:
                    n = _normalize_phone(cp["telephone"])
                    if n:
                        phones.add(n)
                elif isinstance(cp, list):
                    for c in cp:
                        if isinstance(c, dict) and "telephone" in c:
                            n = _normalize_phone(c["telephone"])
                            if n:
                                phones.add(n)
        except (json.JSONDecodeError, TypeError, KeyError):
            continue

    # ── Düz metin regex ──
    text = unescape(soup.get_text())
    for pattern in PHONE_PATTERNS:
        for match in pattern.findall(text):
            n = _normalize_phone(match)
            if n:
                phones.add(n)

    # ── 444 kısa numaralar ──
    for match in PHONE_444_PATTERN.findall(text):
        cleaned = re.sub(r'\s+', '', match)
        phones.add(cleaned)

    # ── tel: bağlantıları ──
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if href.lower().startswith("tel:"):
            n = _normalize_phone(unquote(href[4:]))
            if n:
                phones.add(n)

    # ── Hedef CSS seçiciler ──
    for selector in TARGET_CSS_SELECTORS:
        try:
            for elem in soup.select(selector):
                elem_text = elem.get_text(" ", strip=True)
                for pattern in PHONE_PATTERNS:
                    for match in pattern.findall(elem_text):
                        n = _normalize_phone(match)
                        if n:
                            phones.add(n)
                for match in PHONE_444_PATTERN.findall(elem_text):
                    cleaned = re.sub(r'\s+', '', match)
                    phones.add(cleaned)
        except Exception:
            continue

    return sorted(phones)


def extract_phones(text: str) -> List[str]:
    """Düz metinden telefon çıkar (geriye uyumluluk)."""
    if not text:
        return []
    phones: Set[str] = set()
    for pattern in PHONE_PATTERNS:
        for match in pattern.findall(text):
            n = _normalize_phone(match)
            if n:
                phones.add(n)
    for match in PHONE_444_PATTERN.findall(text):
        cleaned = re.sub(r'\s+', '', match)
        phones.add(cleaned)
    return sorted(phones)


# ══════════════════════════════════════════════════════════
# JSON-LD ADRES ÇIKARMA
# ══════════════════════════════════════════════════════════

def extract_address_from_jsonld(html: str) -> Optional[str]:
    """JSON-LD'den adres çıkar."""
    if not html:
        return None
    soup = BeautifulSoup(html, "html.parser")
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            items = data if isinstance(data, list) else [data]
            for item in items:
                if not isinstance(item, dict):
                    continue
                addr = item.get("address")
                if isinstance(addr, dict):
                    parts = [
                        addr.get("streetAddress", ""),
                        addr.get("addressLocality", ""),
                        addr.get("addressRegion", ""),
                        addr.get("postalCode", ""),
                        addr.get("addressCountry", ""),
                    ]
                    combined = ", ".join(p for p in parts if p)
                    if combined:
                        return combined
                elif isinstance(addr, str) and len(addr) > 5:
                    return addr
        except (json.JSONDecodeError, TypeError, KeyError):
            continue
    return None


# ══════════════════════════════════════════════════════════
# KİŞİ ADI + ÜNVAN ÇIKARMA
# ══════════════════════════════════════════════════════════

def extract_person_details(html: str) -> Tuple[Optional[str], Optional[str]]:
    """
    HTML'den ilgili kişi adı ve ünvanını çıkar.
    40+ Türkçe/İngilizce ünvan arar.
    Returns: (kişi_adı, ünvan) veya (None, None)
    """
    if not html:
        return None, None

    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator="\n")

    # Türkçe karakter destekli isim pattern'ı
    name_pattern = r"([A-Za-zÇçĞğİıÖöŞşÜü\.\s]{2,50})"

    for title_key, canonical_title in TARGET_TITLES.items():
        try:
            match = re.search(
                rf"{name_pattern}\s*,?\s*(?i){re.escape(title_key)}",
                text
            )
            if match:
                potential_name = match.group(1).strip()
                cleaned_name = " ".join(potential_name.split())
                # İsim kontrolü: 2-4 kelime, 3+ karakter
                if len(cleaned_name.split()) > 4 or len(cleaned_name) < 3:
                    continue
                return cleaned_name, canonical_title
        except re.error:
            continue

    return None, None


# ══════════════════════════════════════════════════════════
# EMAIL TÜREV ÜRETİMİ
# ══════════════════════════════════════════════════════════

def generate_email_variants(email: str) -> Dict[str, str]:
    """
    Bir e-posta adresinden satış departmanı varyantları üret.
    Örnek: info@firma.com → satinalma@firma.com, uretim@firma.com
    """
    if not email or "@" not in email:
        return {}

    _, domain = email.split("@", 1)
    variants = {"email_original": email}

    for prefix in EMAIL_VARIANT_PREFIXES:
        key = f"email_{prefix}"
        variants[key] = f"{prefix}@{domain}"

    return variants


def generate_variants_from_domain(domain: str) -> Dict[str, str]:
    """Domain'den direkt türev e-postalar üret."""
    if not domain:
        return {}
    variants = {}
    for prefix in EMAIL_VARIANT_PREFIXES:
        key = f"email_{prefix}"
        variants[key] = f"{prefix}@{domain}"
    return variants


# ══════════════════════════════════════════════════════════
# SOSYAL MEDYA BAĞLANTILARI
# ══════════════════════════════════════════════════════════

def extract_social_links(soup=None) -> dict:
    """HTML içinden sosyal medya bağlantılarını çıkar."""
    social = {}
    if soup:
        for a in soup.find_all('a', href=True):
            href = a['href'].lower()
            if 'linkedin.com/company' in href:
                social['linkedin'] = a['href']
            elif 'twitter.com' in href or 'x.com' in href:
                social['twitter'] = a['href']
            elif 'facebook.com' in href:
                social['facebook'] = a['href']
            elif 'instagram.com' in href:
                social['instagram'] = a['href']
    return social

