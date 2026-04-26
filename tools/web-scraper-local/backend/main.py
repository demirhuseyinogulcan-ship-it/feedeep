"""
feedeep Web Scraper - Local API Sunucusu
FastAPI uygulaması: arama, kazıma, dışa aktarma ve istatistik endpointleri.
"""
import json
import time
import logging
from datetime import datetime
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from config import settings
from database import init_db, get_db, SessionLocal
from models import Query, Company
from search_engine import get_search_engine
from website_scraper import scraper as website_scraper
from google_maps_crawler import maps_crawler
from filters import domain_filter

# ── Loglama ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-20s │ %(levelname)-7s │ %(message)s",
)
logger = logging.getLogger("feedeep-web-scraper")

# ── Veritabanı başlat ───────────────────────────────────
init_db()
logger.info("Veritabanı tabloları oluşturuldu")

# ── Takılı sorguları temizle (sunucu kapanmışken yarım kalmış olanlar) ──
def _cleanup_stale_queries():
    db = SessionLocal()
    try:
        stale = db.query(Query).filter(Query.status.in_(["running", "pending"])).all()
        for q in stale:
            q.status = "failed"
            q.error_message = "Sunucu yeniden başlatıldı, arama iptal edildi"
            q.completed_at = datetime.utcnow()
            logger.warning(f"Takılı sorgu temizlendi: #{q.id} '{q.search_term}'")
        db.commit()
    finally:
        db.close()

_cleanup_stale_queries()

# ── FastAPI uygulama ────────────────────────────────────
app = FastAPI(
    title="feedeep Web Scraper",
    description="Yerel veri kazıma ve firma araştırma API'si",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=settings.MAX_CONCURRENT_SCRAPES)


# ══════════════════════════════════════════════════════════
# PYDANTIC ŞEMALARI
# ══════════════════════════════════════════════════════════

class SearchRequest(BaseModel):
    query: str
    region: Optional[str] = None
    language: str = "tr"
    max_results: int = 50
    search_source: str = "Google"  # "Google", "Maps", "Her İkisi"


class QueryResponse(BaseModel):
    id: int
    search_term: str
    region: Optional[str]
    status: str
    results_count: int
    new_count: int
    duplicate_count: int
    filtered_count: int
    created_at: str
    completed_at: Optional[str]
    error_message: Optional[str]


# ══════════════════════════════════════════════════════════
# ARKA PLAN GÖREVLERİ
# ══════════════════════════════════════════════════════════

def check_duplicate(db: Session, domain: str, current_query_id: int) -> tuple:
    """Bir domain'in daha önceki sorgularda bulunup bulunmadığını kontrol et."""
    if not domain:
        return False, None

    existing = (
        db.query(Company)
        .filter(
            Company.domain == domain,
            Company.query_id != current_query_id,
            Company.is_duplicate == False,
        )
        .first()
    )

    if existing:
        return True, existing.query_id
    return False, None


def run_search_task(query_id: int):
    """
    Arka plan görevi: Seçilen kaynağa göre arama yap →
    sonuçları filtrele → her siteyi kazı → veritabanına kaydet.
    Kaynaklar: Google, Maps, Her İkisi
    """
    db = SessionLocal()
    try:
        query = db.query(Query).filter(Query.id == query_id).first()
        if not query:
            return

        query.status = "running"
        db.commit()

        search_source = getattr(query, 'search_source', None) or "Google"
        logger.info(f"Arama başladı: '{query.search_term}' (Kaynak: {search_source})")

        new_count = 0
        duplicate_count = 0
        filtered_count = 0
        seen_domains = set()

        num_results = query.max_results or settings.MAX_SEARCH_RESULTS

        # ── Google Arama ────────────────────────────────
        if search_source in ("Google", "Her İkisi"):
            google_new, google_dup, google_filt = _run_google_search(
                db, query, num_results, seen_domains
            )
            new_count += google_new
            duplicate_count += google_dup
            filtered_count += google_filt

        # ── Google Maps Arama ───────────────────────────
        if search_source in ("Maps", "Her İkisi"):
            maps_new, maps_dup = _run_maps_search(
                db, query, num_results, seen_domains
            )
            new_count += maps_new
            duplicate_count += maps_dup

        # ── 4. Sorgu durumunu güncelle ──────────────────
        query.status = "completed"
        query.results_count = new_count + duplicate_count
        query.new_count = new_count
        query.duplicate_count = duplicate_count
        query.filtered_count = filtered_count
        query.completed_at = datetime.utcnow()
        db.commit()

        logger.info(
            f"Arama tamamlandı: '{query.search_term}' → "
            f"{new_count} yeni, {duplicate_count} tekrar, "
            f"{filtered_count} filtrelendi"
        )

    except Exception as e:
        logger.error(f"Arama görevi başarısız (sorgu #{query_id}): {e}")
        query = db.query(Query).filter(Query.id == query_id).first()
        if query:
            query.status = "failed"
            query.error_message = str(e)[:1000]
            db.commit()
    finally:
        db.close()


def _run_google_search(db: Session, query: Query, num_results: int, seen_domains: set):
    """Google araması yap ve sonuçları kaydet."""
    new_count = 0
    duplicate_count = 0

    search_engine = get_search_engine()
    search_results = search_engine.search(
        query=query.search_term,
        num_results=num_results,
        lang=query.language,
        region=query.region,
    )

    results_dicts = [r.to_dict() for r in search_results]
    filtered_results = domain_filter.filter_urls(results_dicts)
    filtered_count = len(results_dicts) - len(filtered_results)
    logger.info(
        f"  Google: {len(results_dicts)} sonuçtan {len(filtered_results)} "
        f"geçerli ({filtered_count} filtrelendi)"
    )

    for i, result in enumerate(filtered_results):
        url = result["url"]
        domain = domain_filter.extract_domain(url)

        if domain in seen_domains:
            continue
        seen_domains.add(domain)

        is_dup, dup_query_id = check_duplicate(db, domain, query.id)

        try:
            logger.info(f"  Google [{i+1}/{len(filtered_results)}] Kazınıyor: {domain}")
            scraped_data = website_scraper.scrape(url)

            company = Company(
                query_id=query.id,
                name=scraped_data.get("name"),
                website=scraped_data.get("website", url),
                domain=domain,
                source_url=url,
                google_title=result.get("title"),
                google_snippet=result.get("snippet"),
                is_duplicate=is_dup,
                duplicate_of_query_id=dup_query_id,
                scraped=True,
                address=scraped_data.get("address"),
                description=scraped_data.get("description"),
                contact_person=scraped_data.get("contact_person"),
                contact_title=scraped_data.get("contact_title"),
                search_source="Google",
            )
            company.emails = scraped_data.get("emails", [])
            company.phones = scraped_data.get("phones", [])
            company.email_variants = scraped_data.get("email_variants", {})

            score = 0.0
            if company.emails: score += 0.35
            if company.phones: score += 0.2
            if company.name: score += 0.15
            if company.address: score += 0.1
            if company.description: score += 0.05
            if company.contact_person: score += 0.15
            company.confidence_score = score

            db.add(company)
            if is_dup:
                duplicate_count += 1
            else:
                new_count += 1

        except Exception as e:
            logger.error(f"  Kazıma hatası {url}: {e}")
            company = Company(
                query_id=query.id,
                website=url,
                domain=domain,
                source_url=url,
                google_title=result.get("title"),
                google_snippet=result.get("snippet"),
                is_duplicate=is_dup,
                duplicate_of_query_id=dup_query_id,
                scraped=False,
                scrape_error=str(e)[:500],
                search_source="Google",
            )
            db.add(company)

        db.commit()
        time.sleep(settings.RATE_LIMIT_DELAY)

    return new_count, duplicate_count, filtered_count


def _run_maps_search(db: Session, query: Query, num_results: int, seen_domains: set):
    """Google Maps araması yap ve sonuçları kaydet."""
    new_count = 0
    duplicate_count = 0

    try:
        maps_results = maps_crawler.search(
            query=query.search_term,
            max_results=num_results,
            lang=query.language,
            region=query.region,
        )
    except Exception as e:
        logger.error(f"  Google Maps arama hatası: {e}")
        return 0, 0

    logger.info(f"  Maps: {len(maps_results)} firma bulundu")

    for i, biz in enumerate(maps_results):
        domain = ""
        website = biz.get("website", "")
        if website:
            domain = domain_filter.extract_domain(website)

        # Blacklisted domain kontrolü (instagram, facebook vb.)
        if domain and domain_filter.is_blacklisted(domain):
            logger.debug(f"  Maps: {domain} blacklisted, atlanıyor")
            continue

        # Domain bazlı tekrar kontrol
        if domain and domain in seen_domains:
            continue
        if domain:
            seen_domains.add(domain)

        is_dup, dup_query_id = check_duplicate(db, domain, query.id) if domain else (False, None)

        try:
            company = Company(
                query_id=query.id,
                name=biz.get("name") or biz.get("google_title"),
                website=website,
                domain=domain,
                source_url=website or f"maps:{biz.get('name', '')}",
                google_title=biz.get("google_title"),
                google_snippet=biz.get("google_snippet"),
                is_duplicate=is_dup,
                duplicate_of_query_id=dup_query_id,
                scraped=bool(website),
                address=biz.get("address"),
                description=biz.get("description"),
                contact_person=biz.get("contact_person"),
                contact_title=biz.get("contact_title"),
                search_source="Google Maps",
            )
            company.emails = biz.get("emails", [])
            company.phones = biz.get("phones", [])
            company.email_variants = biz.get("email_variants", {})

            score = 0.0
            if company.emails: score += 0.35
            if company.phones: score += 0.2
            if company.name: score += 0.15
            if company.address: score += 0.1
            if company.description: score += 0.05
            if company.contact_person: score += 0.15
            company.confidence_score = score

            db.add(company)
            if is_dup:
                duplicate_count += 1
            else:
                new_count += 1

        except Exception as e:
            logger.error(f"  Maps kayıt hatası ({biz.get('name')}): {e}")

        db.commit()

    return new_count, duplicate_count


# ══════════════════════════════════════════════════════════
# API ENDPOINT'LERİ
# ══════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {
        "message": "feedeep Web Scraper API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.post("/api/search", response_model=QueryResponse)
def start_search(
    request: SearchRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Yeni bir arama sorgusu başlat."""
    query = Query(
        search_term=request.query,
        region=request.region,
        language=request.language,
        max_results=min(request.max_results, 300),
        search_source=request.search_source,
        status="pending",
    )
    db.add(query)
    db.commit()
    db.refresh(query)

    # Arka planda çalıştır
    background_tasks.add_task(run_search_task, query.id)

    return QueryResponse(
        id=query.id,
        search_term=query.search_term,
        region=query.region,
        status=query.status,
        results_count=0,
        new_count=0,
        duplicate_count=0,
        filtered_count=0,
        created_at=query.created_at.isoformat(),
        completed_at=None,
        error_message=None,
    )


@app.get("/api/queries", response_model=List[QueryResponse])
def get_queries(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Tüm arama sorgularını getir (en yeniden en eskiye)."""
    queries = (
        db.query(Query)
        .order_by(desc(Query.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        QueryResponse(
            id=q.id,
            search_term=q.search_term,
            region=q.region,
            status=q.status,
            results_count=q.results_count,
            new_count=q.new_count,
            duplicate_count=q.duplicate_count,
            filtered_count=q.filtered_count,
            created_at=q.created_at.isoformat(),
            completed_at=q.completed_at.isoformat() if q.completed_at else None,
            error_message=q.error_message,
        )
        for q in queries
    ]


@app.get("/api/queries/{query_id}", response_model=QueryResponse)
def get_query(query_id: int, db: Session = Depends(get_db)):
    """Belirli bir sorguyu getir."""
    query = db.query(Query).filter(Query.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Sorgu bulunamadı")

    return QueryResponse(
        id=query.id,
        search_term=query.search_term,
        region=query.region,
        status=query.status,
        results_count=query.results_count,
        new_count=query.new_count,
        duplicate_count=query.duplicate_count,
        filtered_count=query.filtered_count,
        created_at=query.created_at.isoformat(),
        completed_at=query.completed_at.isoformat() if query.completed_at else None,
        error_message=query.error_message,
    )


@app.post("/api/queries/{query_id}/cancel")
def cancel_query(query_id: int, db: Session = Depends(get_db)):
    """Takılı bir aramayı iptal et."""
    query = db.query(Query).filter(Query.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Sorgu bulunamadı")
    if query.status in ("running", "pending"):
        query.status = "failed"
        query.error_message = "Kullanıcı tarafından iptal edildi"
        query.completed_at = datetime.utcnow()
        db.commit()
    return {"message": "Sorgu iptal edildi", "id": query_id}


@app.delete("/api/queries/{query_id}")
def delete_query(query_id: int, db: Session = Depends(get_db)):
    """Bir sorguyu ve firmalarını sil."""
    query = db.query(Query).filter(Query.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Sorgu bulunamadı")
    db.query(Company).filter(Company.query_id == query_id).delete()
    db.delete(query)
    db.commit()
    return {"message": "Sorgu silindi", "id": query_id}


@app.get("/api/queries/{query_id}/companies")
def get_query_companies(
    query_id: int,
    include_duplicates: bool = True,
    db: Session = Depends(get_db),
):
    """Bir sorgunun bulduğu firmaları getir."""
    query = db.query(Query).filter(Query.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Sorgu bulunamadı")

    q = db.query(Company).filter(Company.query_id == query_id)
    if not include_duplicates:
        q = q.filter(Company.is_duplicate == False)

    companies = q.order_by(desc(Company.confidence_score)).all()
    return [c.to_dict() for c in companies]


@app.get("/api/companies")
def get_all_companies(
    include_duplicates: bool = False,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Tüm sorguların firmalarını getir (arama ve filtreleme ile)."""
    q = db.query(Company)

    if not include_duplicates:
        q = q.filter(Company.is_duplicate == False)

    if search:
        q = q.filter(
            (Company.name.ilike(f"%{search}%"))
            | (Company.domain.ilike(f"%{search}%"))
            | (Company.emails_json.ilike(f"%{search}%"))
        )

    total = q.count()
    companies = (
        q.order_by(desc(Company.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "companies": [c.to_dict() for c in companies],
    }


@app.delete("/api/queries/{query_id}")
def delete_query(query_id: int, db: Session = Depends(get_db)):
    """Bir sorguyu ve ilişkili firmaları sil."""
    query = db.query(Query).filter(Query.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Sorgu bulunamadı")

    db.delete(query)
    db.commit()
    return {"message": "Sorgu başarıyla silindi"}


@app.get("/api/export/{query_id}")
def export_query(
    query_id: int,
    format: str = "csv",
    include_duplicates: bool = False,
    db: Session = Depends(get_db),
):
    """Sorgu sonuçlarını CSV veya Excel olarak dışa aktar."""
    query = db.query(Query).filter(Query.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Sorgu bulunamadı")

    q = db.query(Company).filter(Company.query_id == query_id)
    if not include_duplicates:
        q = q.filter(Company.is_duplicate == False)

    companies = q.all()

    if format == "csv":
        return _export_csv(companies, f"sorgu_{query_id}")
    elif format == "excel":
        return _export_excel(companies, f"sorgu_{query_id}")
    else:
        raise HTTPException(
            status_code=400, detail="Geçersiz format. 'csv' veya 'excel' kullanın"
        )


@app.get("/api/export-all")
def export_all(
    format: str = "csv",
    include_duplicates: bool = False,
    db: Session = Depends(get_db),
):
    """Tüm firmaları dışa aktar."""
    q = db.query(Company)
    if not include_duplicates:
        q = q.filter(Company.is_duplicate == False)

    companies = q.order_by(desc(Company.created_at)).all()

    if format == "csv":
        return _export_csv(companies, "tum_firmalar")
    elif format == "excel":
        return _export_excel(companies, "tum_firmalar")
    else:
        raise HTTPException(status_code=400, detail="Geçersiz format")


@app.get("/api/export-master")
def export_master(
    format: str = "excel",
    db: Session = Depends(get_db),
):
    """
    MASTER LİSTE: Tüm sorguların sonuçlarını birleştir,
    domain + email bazlı tekrar ayıkla, tek Excel/CSV olarak ver.
    Aynı firma birden fazla sorguda çıksa bile sadece 1 kez görünür.
    """
    all_companies = (
        db.query(Company)
        .filter(Company.is_duplicate == False)
        .order_by(desc(Company.confidence_score))
        .all()
    )

    # Domain + email bazlı tekrar ayıklama
    seen_domains = set()
    seen_emails = set()
    unique_companies = []

    for c in all_companies:
        # Domain kontrolü
        if c.domain and c.domain in seen_domains:
            continue

        # Email kontrolü (herhangi bir email daha önce görüldüyse atla)
        company_emails = set(c.emails) if c.emails else set()
        if company_emails and company_emails & seen_emails:
            continue

        # Bu firmayı ekle
        if c.domain:
            seen_domains.add(c.domain)
        seen_emails.update(company_emails)
        unique_companies.append(c)

    if format == "csv":
        return _export_csv(unique_companies, "master_liste")
    elif format == "excel":
        return _export_excel(unique_companies, "master_liste")
    else:
        raise HTTPException(status_code=400, detail="Geçersiz format")


@app.get("/api/master-list")
def get_master_list(
    skip: int = 0,
    limit: int = 200,
    search: Optional[str] = None,
    only_with_email: bool = False,
    db: Session = Depends(get_db),
):
    """
    Master firma listesi: tüm sorgulardan benzersiz firmalar.
    Domain + email bazlı tekrar ayıklanmış.
    """
    q = db.query(Company).filter(Company.is_duplicate == False)

    if search:
        q = q.filter(
            (Company.name.ilike(f"%{search}%"))
            | (Company.domain.ilike(f"%{search}%"))
            | (Company.emails_json.ilike(f"%{search}%"))
            | (Company.address.ilike(f"%{search}%"))
        )

    if only_with_email:
        q = q.filter(
            Company.emails_json != "[]",
            Company.emails_json.isnot(None),
        )

    all_companies = q.order_by(desc(Company.confidence_score)).all()

    # Domain + email bazlı tekrar ayıklama
    seen_domains = set()
    seen_emails = set()
    unique_companies = []

    for c in all_companies:
        if c.domain and c.domain in seen_domains:
            continue
        company_emails = set(c.emails) if c.emails else set()
        if company_emails and company_emails & seen_emails:
            continue
        if c.domain:
            seen_domains.add(c.domain)
        seen_emails.update(company_emails)
        unique_companies.append(c)

    total = len(unique_companies)
    page = unique_companies[skip:skip + limit]

    # Her firma için hangi sorgularda bulunduğunu ekle
    result = []
    for c in page:
        d = c.to_dict()
        # Bu domain'i içeren tüm sorguları bul
        query_obj = db.query(Query).filter(Query.id == c.query_id).first()
        d["query_name"] = query_obj.search_term if query_obj else ""
        d["query_region"] = query_obj.region if query_obj else ""
        result.append(d)

    return {
        "total": total,
        "companies": result,
    }


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Genel istatistikleri getir."""
    total_queries = db.query(Query).count()
    total_companies = (
        db.query(Company).filter(Company.is_duplicate == False).count()
    )
    total_with_email = (
        db.query(Company)
        .filter(
            Company.is_duplicate == False,
            Company.emails_json != "[]",
            Company.emails_json.isnot(None),
        )
        .count()
    )
    total_duplicates = (
        db.query(Company).filter(Company.is_duplicate == True).count()
    )

    return {
        "total_queries": total_queries,
        "total_companies": total_companies,
        "total_with_email": total_with_email,
        "total_duplicates": total_duplicates,
    }


# ══════════════════════════════════════════════════════════
# DIŞA AKTARMA FONKSİYONLARI
# ══════════════════════════════════════════════════════════

def _export_csv(companies: list, filename: str) -> StreamingResponse:
    """CSV formatında dışa aktar."""
    import csv
    from io import StringIO

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Firma Adı", "Website", "Domain", "E-posta",
        "Telefon", "Adres", "Açıklama", "İlgili Kişi", "Unvan",
        "E-posta Varyantları", "Kaynak", "Arama Kaynağı", "Güven Skoru",
    ])

    for c in companies:
        # Email varyantlarını düz metin olarak yaz
        variants = c.email_variants if c.email_variants else {}
        variants_str = ", ".join(variants.values()) if variants else ""

        writer.writerow([
            c.name or "",
            c.website or "",
            c.domain or "",
            ", ".join(c.emails) if c.emails else "",
            ", ".join(c.phones) if c.phones else "",
            c.address or "",
            (c.description or "")[:200],
            c.contact_person or "",
            c.contact_title or "",
            variants_str,
            c.source_url or "",
            c.search_source or "Google",
            f"{c.confidence_score:.1f}",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}.csv"'
        },
    )


def _export_excel(companies: list, filename: str) -> StreamingResponse:
    """Excel formatında dışa aktar."""
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

    wb = Workbook()
    ws = wb.active
    ws.title = "Firmalar"

    headers = [
        "Firma Adı", "Website", "Domain", "E-posta",
        "Telefon", "Adres", "İlgili Kişi", "Unvan",
        "Satınalma E-posta", "Üretim E-posta", "Sipariş E-posta",
        "İhracat E-posta", "Muhasebe E-posta", "Satış E-posta",
        "Açıklama", "Arama Kaynağı", "Güven Skoru",
    ]
    ws.append(headers)

    # Başlık stili
    header_font = Font(bold=True, color="FFFFFF", size=11)
    header_fill = PatternFill(
        start_color="1E40AF", end_color="1E40AF", fill_type="solid"
    )
    thin_border = Border(
        bottom=Side(style='thin', color='DDDDDD')
    )
    for cell in ws[1]:
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    # Veri satırları
    for c in companies:
        variants = c.email_variants if c.email_variants else {}
        ws.append([
            c.name or "",
            c.website or "",
            c.domain or "",
            ", ".join(c.emails) if c.emails else "",
            ", ".join(c.phones) if c.phones else "",
            c.address or "",
            c.contact_person or "",
            c.contact_title or "",
            variants.get("email_satinalma", ""),
            variants.get("email_uretim", ""),
            variants.get("email_siparis", ""),
            variants.get("email_ihracat", ""),
            variants.get("email_muhasebe", ""),
            variants.get("email_satis", ""),
            (c.description or "")[:200],
            c.search_source or "Google",
            c.confidence_score,
        ])

    # Satır zebra renklendirme
    light_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    for idx, row in enumerate(ws.iter_rows(min_row=2, max_row=ws.max_row), start=2):
        if idx % 2 == 0:
            for cell in row:
                cell.fill = light_fill
        for cell in row:
            cell.border = thin_border

    # Sütun genişlikleri
    col_widths = {
        'A': 30, 'B': 35, 'C': 22, 'D': 35,
        'E': 25, 'F': 40, 'G': 20, 'H': 20,
        'I': 30, 'J': 30, 'K': 30, 'L': 30,
        'M': 30, 'N': 30, 'O': 40, 'P': 15, 'Q': 12,
    }
    for col_letter, width in col_widths.items():
        ws.column_dimensions[col_letter].width = width

    # Filtre ekle
    ws.auto_filter.ref = ws.dimensions

    # Sayfayı dondur (başlık satırı)
    ws.freeze_panes = 'A2'

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}.xlsx"'
        },
    )


# ══════════════════════════════════════════════════════════
# ÇALIŞTIR
# ══════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
