# AI Rehber — WordPress → Vercel Geçiş Planı

> airehber.com alan adını WordPress'ten Vercel'e taşıma adımları.
> Hedef: Sıfır kesinti (zero downtime) geçiş.

---

## Mevcut Durum

| Öğe | Durum |
|-----|-------|
| Domain | `airehber.com` — WordPress'te aktif |
| Next.js sitesi | Lokal geliştirmede, deploy edilmemiş |
| İçerik | 5 MDX dosyası (1 per collection) |
| Git repo | Henüz oluşturulmamış (lokal dosyalar) |

---

## Faz 1 — Hazırlık (Geçiş Öncesi)

### 1.1 Git Repository Oluştur
```bash
cd airehber
git init
git add .
git commit -m "feat(infra): initial commit — Next.js 16 + Velite content system"
```

### 1.2 GitHub'a Push Et
```bash
# GitHub'da "airehber" adında private repo oluştur
git remote add origin https://github.com/KULLANICI/airehber.git
git push -u origin main
```

### 1.3 Vercel'e Bağla
1. [vercel.com](https://vercel.com) → "Add New Project"
2. GitHub repo'sunu seç → Import
3. Framework: **Next.js** (otomatik algılar)
4. Build Command: `next build --webpack` (zaten package.json'da)
5. Output Directory: `.next` (varsayılan)
6. Deploy et → `airehber-xxxxx.vercel.app` adresi oluşur

### 1.4 Vercel'de Test Et
- Tüm sayfaları kontrol et (23 route)
- OG image çalışıyor mu? (`/api/og?title=Test`)
- RSS feed çalışıyor mu? (`/feed.xml`)
- `llms.txt` erişilebilir mi?
- Mobil görünüm OK mi?
- Performans: Lighthouse skoru ≥ 90

---

## Faz 2 — Domain Geçişi

### Seçenek A: Vercel DNS (Önerilen)
1. Vercel Dashboard → Project → Settings → Domains
2. `airehber.com` ekle
3. Vercel'in verdiği nameserver'ları domain kayıt sitesine gir:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. DNS yayılımını bekle (genelde 1-24 saat)
5. Vercel otomatik SSL sertifikası oluşturur

### Seçenek B: Sadece A/CNAME (Mevcut DNS'i Koruma)
1. Domain kayıt sitesinde:
   - `A` kaydı: `76.76.21.21` → `airehber.com`
   - `CNAME` kaydı: `cname.vercel-dns.com` → `www.airehber.com`
2. Vercel Dashboard'da domain'i doğrula

### WordPress Kapatma Süreci
1. WordPress'teki tüm içeriği yedekle (export)
2. DNS değişikliğini yap
3. 24 saat bekle (DNS yayılımı)
4. Vercel'de site erişilebilir olduğunu doğrula
5. WordPress hosting'i kapat/dondur (acil geri dönüş için 1 ay bekle)
6. 1 ay sonra WordPress hosting'i tamamen iptal et

---

## Faz 3 — Geçiş Sonrası

### 3.1 Redirect'ler (Eski URL → Yeni URL)
WordPress'teki eski URL'ler Next.js'te farklı olabilir. `next.config.ts`'e redirect ekle:

```typescript
async redirects() {
  return [
    // WordPress eski URL'leri → yeni URL'ler
    // { source: '/wp-content/:path*', destination: '/404', permanent: true },
    // { source: '/wp-admin', destination: '/', permanent: true },
    // { source: '/?p=:id', destination: '/', permanent: true },
  ];
}
```

### 3.2 Google Search Console
1. Vercel deploy sonrası sitemap.xml'i submit et: `https://airehber.com/sitemap.xml`
2. Eski WordPress URL'lerin 301 redirect verdiğini kontrol et
3. Coverage report'u 1 hafta takip et

### 3.3 Email DNS (can@airehber.com)
Eğer email hizmeti domain DNS'ine bağlıysa:
- **MX kayıtları** korunmalı (Outlook/Google Workspace)
- Vercel DNS kullanıyorsan MX kayıtlarını Vercel'de tekrar ekle
- SPF, DKIM, DMARC kayıtları da taşınmalı (mail deliverability için)

---

## Faz 4 — CI/CD Pipeline

Vercel'e bağlandıktan sonra otomatik deploy akışı:

```
main branch'e push → Vercel otomatik build → Production deploy
                  ↓
            preview branch → Vercel preview URL (test)
```

### Önerilen Git Workflow
```bash
# 1. Yeni içerik/özellik için branch aç
git checkout -b content/yeni-haber-basligi

# 2. İçeriği ekle
npm run new:haber
# ... içeriği yaz ...

# 3. Doğrula
npm run validate

# 4. Commit
git add .
git commit -m "content(haberler): OpenAI yeni model duyurusu"

# 5. Push (Vercel preview deploy başlar)
git push origin content/yeni-haber-basligi

# 6. Preview URL'de kontrol et
# 7. main'e merge et (production deploy)
git checkout main
git merge content/yeni-haber-basligi
git push origin main
```

---

## Kontrol Listesi

```
Faz 1 — Hazırlık
□ Git init + ilk commit
□ GitHub private repo oluştur
□ Vercel'e bağla ve deploy et
□ Vercel preview URL'de tüm sayfaları test et
□ Lighthouse performans skoru ≥ 90

Faz 2 — Domain
□ WordPress içeriği yedekle
□ Vercel'de domain ekle
□ DNS değişikliği yap (nameserver veya A/CNAME)
□ SSL sertifikası aktif olduğunu doğrula
□ airehber.com Vercel'e yönleniyor mu kontrol et
□ Email MX kayıtları korundu mu doğrula

Faz 3 — Geçiş Sonrası
□ Eski WordPress URL redirect'leri ekle
□ Google Search Console sitemap submit
□ robots.txt erişilebilir
□ OG image, RSS feed, llms.txt çalışıyor
□ 1 hafta monitoring

Faz 4 — CI/CD
□ Git workflow dökümante edildi
□ İlk content commit + Vercel auto-deploy test
□ Preview deploy çalışıyor
```

---

## Zaman Tahmini

| Faz | Süre | Not |
|-----|------|-----|
| Faz 1 | 1 akşam | Git + GitHub + Vercel kurulumu |
| Faz 2 | 1-2 gün | DNS yayılımı bekleme |
| Faz 3 | 1 akşam | Redirect + SEO kontrol |
| Faz 4 | Sürekli | Her commit otomatik |

**Toplam:** ~3 gün içinde tam geçiş tamamlanabilir.

---

## Risk ve Geri Dönüş Planı

| Risk | Önlem |
|------|-------|
| DNS yayılımı uzar | WordPress'i 1 ay açık tut |
| Email bozulur | MX kayıtlarını önceden kontrol et |
| SEO sıralaması düşer | 301 redirect + sitemap submit |
| Build hatası | `npm run validate` + preview deploy |
