# AI Rehber — Değişiklik Günlüğü (Changelog)

> Her oturumda yapılan işler burada kayıt altına alınır.
> Format: Tarih → Oturum özeti → Yapılan işler listesi

---

## [2026-02-15] Oturum 7 — Haber Otomasyon Sistemi v2

### Eklenen
- `config.mjs` — Merkezi yapılandırma modülü (34 kaynak, 50+ AI anahtar kelime, etiket haritası, öncelik algoritması)
- `arsiv.mjs` — Arşiv & yayın takip yöneticisi (dashboard, durum yönetimi, arama, sıralama)
- `sosyal.mjs` — Sosyal medya formatçısı (LinkedIn + WhatsApp hazır metin üretimi)
- `arsiv/` klasörü — Günlük JSON snapshot arşivi
- `veritabani.json` — Master veritabanı (duplikasyon engelli, 41 başlangıç haberi)
- 13 yeni RSS kaynağı (21 → 34): Meta AI, DeepMind, Microsoft AI, NVIDIA AI, Amazon Science, Apple ML, Simon Willison, Marktechpost, Unite.AI, The Batch, Import AI, Sebastian Raschka, Girişim Haber
- Otomatik etiketleme sistemi (30+ etiket haritası: model adları, teknik konular, uygulama alanları)
- Öncelik puanlama algoritması (0-10: kaynak ağırlığı %40 + AI kelime yoğunluğu %30 + güncellik %20 + dil bonusu %10)
- Duplikasyon engelleme (URL hash tabanlı benzersiz ID)
- TOP 5 öncelik sıralaması terminal çıktısında

### Değiştirilen
- `haberler.mjs` — v2 tam yeniden yazım: config.mjs'den import, arşivleme, etiketleme, puanlama
- `haberler.mjs` — Yeni flagler: `--kaydet` (arşivle), `--no-filter` (filtre atla)
- `package.json` — v2.0.0, 10 yeni script: gunluk, tara, arsiv, sosyal + varyantlar
- Kategori sistemi genişletildi: topluluk, güvenlik kategorileri eklendi

### Test Sonuçları
- 34 kaynak, 28'i başarılı, 6 hata (Anthropic 404, Meta AI 404, Amazon timeout, Unite.AI XML, The Batch 404, Girişim Haber XML)
- 52 ham haber → AI filtresi → 41 sonuç (11 alakasız elendi)
- Arşiv: arsiv/2026-02-15.json (25KB) + veritabani.json (33KB)
- Dashboard, top, sosyal komutları test edildi ✅

---

## [2026-02-15] Oturum 6 — İçerik Toplama & Operasyonel Altyapı

### Eklenen
- `haberler.mjs` — 7 yeni RSS kaynağı (14 → 21): Hacker News, Lobste.rs, Dev.to, fast.ai, InfoQ, Dark Reading
- AI anahtar kelime filtresi (`--filter-ai` flag): Genel teknoloji kaynaklarından gelen haberleri otomatik filtreler
- `AI_ANAHTAR_KELIMELER` dizisi: 40+ Türkçe/İngilizce AI terimi
- `haberler_2026-02-15.json` — İlk otomatik JSON çıktısı (36 haber → 27 filtrelenmiş)
- `CONTENT_SYSTEM.md` §11 — Email bülten stratejisi (can@airehber.com, Outlook tabanlı)
- `CONTENT_SYSTEM.md` §12 — Mobil strateji (PWA → Native karar ağacı)
- `CONTENT_SYSTEM.md` §13 — Commit & arşiv sistemi

### Değiştirilen
- `haberler.mjs` — JSON çıktı yolu: Hardcoded path → `__dirname` tabanlı dinamik yol
- `haberler.mjs` — `import { join, dirname }` ve `fileURLToPath` eklendi
- `CONTENT_SYSTEM.md` §5 — Çalışma takvimi güncellendi (20:00-23:00 penceresi)
- `web analiz.txt` — 80+ site analiz edildi, AI-relevant olanlar belirlendi

### Düzeltilen
- Anthropic RSS (feed.xml) 404 hatası — Source aktif bırakıldı, hata yakalanıyor
- fast.ai RSS URL'si (atom.xml → index.xml)
- Indie Hackers RSS parsing hatası — Kaynak devre dışı, web scrape notu eklendi
- JSON dosya kayıt yolu ENOENT hatası (hardcoded Windows path)

---

## [2026-02-15] Oturum 5 — İçerik Mühendisliği Sistemi

### Eklenen
- `CONTENT_SYSTEM.md` — 10 bölümlük master editoryal kılavuz
- `CLAUDE.md` — AI ajanları için otomatik kural dosyası
- `CHANGELOG.md` — Bu dosya (değişiklik takip sistemi)
- `content/_templates/` — 5 MDX şablonu (yazı, haber, prompt, kart, haftalık)
- `scripts/validate-content.mjs` — Frontmatter doğrulayıcı (gray-matter)
- `scripts/new-content.mjs` — İçerik scaffold aracı (planlanan)
- `src/lib/timeline-data.ts` — Editoryal timeline verisi (sayfa bileşeninden ayrıştırıldı)
- `MIGRATION_PLAN.md` — WordPress → Vercel geçiş planı

### Değiştirilen
- `package.json` — 7 yeni npm script eklendi (new:yazi/haber/prompt/kart/haftalik, validate, prebuild)
- `public/llms.txt` — Email `can@` → `info@airehber.com` standardizasyonu
- `src/app/zaman-cizelgesi/page.tsx` — Hardcoded EDITORIAL_TIMELINE → import from lib

### Düzeltilen
- Email tutarsızlığı (llms.txt vs constants.ts)
- Timeline verisi page component'tan ayrıştırıldı (SRP)

---

## [2026-02-14] Oturum 4 — Bug Fix & Kod Temizliği

### Düzeltilen
- Anasayfa "Son Yazılar" bölümü boştu (1 içerik olunca slice(1,4) boş döndü)
- PromptCard "Kopyala" butonu çalışmıyordu → CopyButton bileşeni ile değiştirildi
- Footer `/gizlilik-politikasi` dead link → `/hakkimizda` ile değiştirildi
- 11 adet kod temizliği (unused imports, dead constants, vb.)

---

## [2026-02-13] Oturum 3 — Velite Entegrasyonu (Tam Yeniden Yazım)

### Eklenen
- 11 shared bileşen: MDXContent, CopyButton, PageHeader, Breadcrumb, ArticleHeader, ProgressBar, FilterableContentList, NewsletterForm, SearchUI, search page, newsletter API
- 5 MDX içerik dosyası (1 per collection)
- `velite.config.ts` — 5 koleksiyon şeması
- `src/lib/seo.ts` — generateMeta()
- `src/lib/utils.ts` — formatDate, cn, slugify
- `public/llms.txt` ve `llms-full.txt`

### Değiştirilen
- Tüm 13 sayfa Velite'e geçirildi (hardcoded → dynamic content)
- `sitemap.ts` — Velite'den otomatik URL üretimi
- `feed.xml/route.ts` — Velite'den RSS feed
- `globals.css` — Tailwind v4 @theme bloğu
- Header/Footer — constants.ts'den NAV_ITEMS kullanımı

---

## [2026-02-12] Oturum 2 — ULTRATHINK Audit

### Analiz
- 18 teknik borç kalemi tespit edildi
- DRY, SOLID, SEO/GEO skorlaması yapıldı
- 4 fazlı geliştirme yol haritası oluşturuldu

---

## [2026-02-11] Oturum 1 — Temel Kurulum

### Eklenen
- Next.js 16 + React 19 + TypeScript + Tailwind v4 projesi oluşturuldu
- "The Void speaks in light" tasarım sistemi uygulandı
- Montserrat + Inter + JetBrains Mono font entegrasyonu
- Tüm temel sayfalar oluşturuldu
- Dark monokrom tema
