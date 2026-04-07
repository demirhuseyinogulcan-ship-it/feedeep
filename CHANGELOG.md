# feedeep — Değişiklik Günlüğü (Changelog)

> Her oturumda yapılan işler burada kayıt altına alınır.
> Format: Tarih → Oturum özeti → Yapılan işler listesi

---

## [2026-03-01] Oturum 12 — P0 SEO + Otomatik İndeksleme Pipeline

### Eklenen
- `.github/workflows/post-deploy-indexing.yml` — Vercel webhook dispatch ve manuel tetikleme için deploy sonrası Search Console submit akışı
- `scripts/submit-indexing.mjs` — `sitemap.xml` ve `news-sitemap.xml` dosyalarını Google Search Console API üzerinden submit eden script
- `src/app/api/indexing/trigger/route.ts` — Vercel webhook çağrısını doğrulayıp GitHub `repository_dispatch` tetikleyen endpoint

### Değiştirilen
- `src/app/page.tsx` — Anasayfa için metadata override eklendi (`noindex`, canonical path)
- `src/app/robots.ts` — Crawler dostu kural seti sadeleştirildi (`/_next/` disallow kaldırıldı, `/api/` disallow korundu)
- `src/lib/seo.ts` — `generateMeta()` canonical override desteği (`canonicalPath`, `canonicalUrl`) ve Organization JSON-LD `email` alanı eklendi
- `scripts/update-llms.mjs` — Public e-posta `info@airehber.com`, operasyonel e-posta `can@airehber.com` olarak netleştirildi
- `.env.example`, `.env.local.example` — Index pipeline için gerekli environment değişkenleri eklendi
- `package.json` — `submit-indexing` scripti ve `googleapis` bağımlılığı eklendi
- `public/llms-full.txt`, `public/llms.txt` — E-posta standardı ve içerik listesi güncellendi

### Build Durumu
- `npm run validate` → 71 dosya, 0 hata ✅
- `npm run build` → exit code 0 ✅

---

## [2026-03-01] Oturum 11 — Anasayfa Mobil Kaydırma UX Düzeltmesi

### Değiştirilen
- `src/app/page.tsx` — Mobilde yatay kaydırılan `Son Haberler`, `Son Yazılar` ve `Keşfet` blokları dikey akışa çevrildi
- `src/app/page.tsx` — Mobil kartlar artık sağa/sola swipe gerektirmeden doğal aşağı kaydırma ile tüketilecek şekilde düzenlendi

### Build Durumu
- `npm run build` → exit code 0 ✅

---

## [2026-02-25] Oturum 10 — Günlük Haber Üretimi (25 Şubat)

### Eklenen
- `content/haberler/meta-amd-100-milyar-dolar-cip-anlasmasi.mdx` — Meta ve AMD 100 milyar dolarlık AI çip anlaşması, 160 milyon hisse opsiyonu
- `content/haberler/atlassian-jira-ai-ajanlari-gorev-yonetimi.mdx` — Jira'ya AI ajanlarına görev atama özelliği (açık beta)
- `content/haberler/adobe-firefly-quick-cut-ai-video-kurgu.mdx` — Adobe Firefly Quick Cut: AI ile otomatik video ilk kurgu
- `content/haberler/anthropic-cin-deepseek-moonshot-claude-distilasyon-suclama.mdx` — Anthropic, üç Çinli şirketi 24.000 sahte hesapla Claude'u kopyalamakla suçladı
- `content/yazilar/chatgpt-kopyala-yapistir-yapay-icerik-guven-krizi.mdx` — AI içerik yorgunluğu analizi: okuyucuların yüzde 50'si AI yazımını fark ediyor, etkileşim yüzde 45 düşüyor
- `content/promptlar/ai-yazilarini-insanlastirma-promptu.mdx` — AI çıktısını insanlaştıran 7 adımlı düzenleme prompt'u

### Kaynak Tarama
- TechCrunch AI kategorisi (24-25 Şubat güncellemeleri) tarandı
- The Verge AI kategorisi kontrol edildi
- Webrazzi yapay zeka kategorisi kontrol edildi
- Birincil doğrulama: WSJ, Anthropic Blog referansları kullanıldı

### Doğrulama
- `npm run validate` → 65 dosya, 0 hata ✅
- `npm run build` → 83 sayfa, exit code 0 ✅
- `public/llms.txt` otomatik güncellendi (48 haber, 8 yazı, 7 prompt, 2 haftalık)

---

## [2026-03-01] Oturum 10 — Günlük Haber Üretimi (1 Mart)

### Eklenen
- `content/haberler/openai-pentagon-anlasmasi-guvenlik-sartlari.mdx` — OpenAI'nin Pentagon anlaşmasındaki teknik güvenlik şartları ve kırmızı çizgiler
- `content/haberler/chatgpt-900-milyon-haftalik-kullaniciya-ulasti.mdx` — ChatGPT'nin 900 milyon haftalık aktif kullanıcı ve 50 milyon abone eşiği
- `content/haberler/openai-110-milyar-dolar-yatirim-duyurusu.mdx` — OpenAI'nin 110 milyar dolarlık yeni yatırım turu ve altyapı ortaklıkları
- `content/haberler/google-nano-banana-2-gorsel-uretimi-hizlandi.mdx` — Google Nano Banana 2 ile hızlanan görsel üretim ve geniş entegrasyon

### Değiştirilen
- `public/llms.txt` — Yeni içeriklerle güncellendi
- `public/llms-full.txt` — Yeni içeriklerle güncellendi

### Kaynak Tarama
- TechCrunch AI kategorisi (26-28 Şubat güncellemeleri) tarandı
- OpenAI resmi duyuruları (`scaling-ai-for-everyone`, `our-agreement-with-the-department-of-war`) incelendi
- Webrazzi yapay zeka kategorisi ve Nano Banana 2 haberi ile çapraz doğrulama yapıldı

### Build Durumu
- `npm run validate` → 71 dosya, 0 hata ✅
- `npm run build` → exit code 0 ✅

---

## [2026-02-23] Oturum 9 — Günlük Haber Üretimi (23 Şubat)

### Eklenen
- `content/haberler/spotify-prompted-playlists-uk-irlanda-avustralya-isvec.mdx` — Spotify Prompted Playlists özelliği 4 yeni pazarda Premium kullanıcılara açıldı
- `content/haberler/pentagon-anthropic-claude-askeri-kullanim-gerilimi.mdx` — Pentagon ve Anthropic arasında Claude'un askeri kullanımı gerilimi
- `content/haberler/apple-visual-intelligence-giyilebilir-cihazlar.mdx` — Apple'ın Visual Intelligence odağını giyilebilir cihazlara taşıma planı
- `content/haberler/recursive-language-models-rlm-baglam-curumesi.mdx` — Recursive Language Models yaklaşımı ve context rot tartışması

### Kaynak Tarama
- TechCrunch AI kategorisi (23 Şubat güncellemeleri) tarandı
- Webrazzi son eklenenler ve yapay zeka kategorisi tarandı
- İkincil doğrulama için Spotify Newsroom, Axios, Bloomberg ve ArXiv referansları kullanıldı

### Doğrulama
- `npm run validate` → 61 dosya, 0 hata ✅

---

## [2026-02-22] Oturum 8 — Günlük Haber Üretimi + Yazı + Prompt + W08 Brifing

### Eklenen
- `content/haberler/anthropic-claude-sonnet-4-6-1m-context-kodlama.mdx` — Anthropic Sonnet 4.6: 1M token bağlam, ARC-AGI-2 %60.4, gelişmiş kodlama (17 Şubat haberi)
- `content/haberler/google-vp-llm-wrapper-aggregator-girisim-hayatta-kalmaz.mdx` — Google Cloud VP Darren Mowry: LLM wrapper ve aggregator iş modellerinin çöküşü (21 Şubat)
- `content/haberler/sam-altman-yapay-zeka-enerji-tuketimi-yanlis-anlasiliyor.mdx` — Sam Altman AI enerji/su tüketimi tartışmasını çerçeveliyor (21 Şubat)
- `content/haberler/youtube-konusmaci-ai-asistani-televizyon-smart-tv.mdx` — YouTube konuşmacı AI özelliği smart TV'lere geliyor (19 Şubat)
- `content/yazilar/cv-robot-reddediyor-ats-sistemi-yapay-zeka.mdx` — Beyaz yakalılar için ATS sistemi rehberi (22 Şubat), HBS 2022 "Hidden Workers" verisi temelli
- `content/promptlar/ats-cv-optimizasyon-promptu.mdx` — İş ilanı + CV eşleştirme, ATS skor tahmini, eksik kelime analizi
- `content/haftalik/2026-w08.mdx` — Haftalık AI Brifing #8 (15-21 Şubat): Sonnet 4.6, Google AI Modu TR, OpenAI $100B

### Değiştirilen
- `public/llms.txt` — 7 yeni içerik eklendi (4 haber + 1 yazı + 1 prompt + 1 haftalık brifing)
- `content/haberler/sam-altman-yapay-zeka-enerji-tuketimi-yanlis-anlasiliyor.mdx` — description 167→147 karakter (validation hatası düzeltildi)
- `content/promptlar/ats-cv-optimizasyon-promptu.mdx` — category kariyer→genel düzeltildi (keywords 6→5 düzeltildi)

### Kaynak Tarama
- TechCrunch AI kategorisi tarandı (22 Şubat)
- Anthropic resmi blog (`anthropic.com/news`) kontrol edildi
- Referans yazı analizi: `airehber.com/yazilar/yoneticiniz-geri-bildirim-egosuz-yapay-zeka` (yazı tonu kılavuzu için)

### Build Durumu
- `npm run validate` → 57 dosya, 0 hata ✅
- `npm run build` → exit code 0 ✅

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
