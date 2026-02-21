# AI Rehber — İçerik Mühendisliği Sistemi

> Bu belge, AI Rehber'in içerik üretim, yayınlama ve kalite kontrol süreçlerini
> tanımlar. **Her katkı sağlayan kişi** bu belgeyi okumalı ve kurallarına
> uymalıdır.

---

## 1. Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────┐
│                    İÇERİK AKIŞI                         │
│                                                         │
│  [Kaynak Bulma] → [İçerik Yazma] → [Kalite Kontrol]   │
│       │                │                  │             │
│   haberler.mjs     MDX Şablonu      Checklist           │
│   RSS feed'ler     Frontmatter      velite build        │
│   Manuel tarama    Editör kuralları  Peer review         │
│       │                │                  │             │
│       └────────────────┼──────────────────┘             │
│                        ▼                                │
│              [Velite Build → .velite/]                   │
│                        ▼                                │
│              [Next.js Build → .next/]                   │
│                        ▼                                │
│              [Deploy → Production]                      │
└─────────────────────────────────────────────────────────┘
```

---

## 2. İçerik Tipleri ve Kuralları

### 2.1 Yazılar (`content/yazilar/`)

**Ne:** Rehber, inceleme, analiz, karşılaştırma yazıları.
**Kadans:** Haftada minimum 2, hedef 3.
**Uzunluk:** Minimum 800 kelime, ideal 1500-3000 kelime.

| Alan | Kural | Örnek |
|------|-------|-------|
| `title` | Max 70 karakter, SEO odaklı, Türkçe | `"ChatGPT vs Claude: 2026 Karşılaştırması"` |
| `slug` | Küçük harf, tire ile ayrılmış, Türkçe karakter YOK | `chatgpt-vs-claude-2026` |
| `description` | Max 160 karakter, Google snippet'i bu | `"İki modeli 7 kriterde test ettik."` |
| `date` | ISO format, yayın tarihi | `2026-02-15` |
| `category` | `rehber` \| `inceleme` \| `analiz` \| `karsilastirma` | `karsilastirma` |
| `keywords` | Max 5, en spesifik olanı ilk sıraya | `["chatgpt vs claude", ...]` |
| `sources` | Min 1, her biri `url`, `label`, `tier(1-3)` | Aşağıya bak |
| `confidence` | `high` \| `medium` \| `speculative` | `high` |
| `lastFactChecked` | Son doğrulama tarihi | `2026-02-15` |
| `counterpoint` | Karşı görüş — zorunlu değil ama güven artırır | `"Benchmark sonuçları gerçek kullanımı..."` |
| `actionItems` | Okuyucuya somut eylem | `["Üç modeli aynı promptla test edin"]` |
| `socialSnippet` | Max 280 karakter, Twitter/X paylaşım metni | |

**Kaynak Tier Sistemi:**
- **Tier 1:** Birincil kaynak — resmi blog, akademik makale, dokümantasyon
- **Tier 2:** Güvenilir medya — CEO/CTO paylaşımı, Reuters, Bloomberg
- **Tier 3:** İkincil kaynak — sızıntı, anonim kaynak, forum

**Yazı Yapısı (Body):**
```
## [Dikkat Çekici Başlık]       ← Neden önemli, hook
## [Ana Konu — Detay]           ← Gerçek değer burada
## [Tablo veya Karşılaştırma]   ← Görsel veri (varsa)
## [Pratik Uygulama]            ← Okuyucu ne yapmalı
## [Sonuç + Bakış]              ← Gelecek perspektifi
```

### 2.2 Haberler (`content/haberler/`)

**Ne:** AI dünyasından güncel haber analizi.
**Kadans:** Haftada minimum 3, hedef 5-7.
**Uzunluk:** 300-800 kelime.

| Alan | Kural |
|------|-------|
| `title` | Max 70 karakter, haber başlığı formatı |
| `sourceUrl` | Orijinal haberin URL'si (zorunlu) |
| `sourceName` | Kaynak adı: `"OpenAI Blog"`, `"TechCrunch"` |
| `category` | `sirketler` \| `sektor` \| `turkiye` \| `arastirma` |
| `sources` | Min 1 kaynak, haberin kaynağı |
| `confidence` | Haber ne kadar doğrulanmış |

**Haber Yazım Stili (Body):**

> **KURAL:** Haber içerikleri sabit başlık şablonu KULLANMAZ.
> Eski "Ne Oldu? / Neden Önemli? / Türkiye İçin" yapısı kaldırılmıştır.

Haberler doğal, akıcı, gazetecilik diline uygun yazılır:
- **Akıcı anlatım:** Paragraflar birbiriyle doğal geçişlerle bağlanır, maddeler yerine düz yazı tercih edilir
- **Eğitici ama çaktırmadan:** Teknik kavramlar (prompt injection, reasoning, fine-tune vb.) anlatımın içinde doğal biçimde açıklanır, ders verir gibi değil
- **Okuyucu bilmiyor varsayımı:** Konuyu ilk defa duyan biri için de anlaşılır olmalı, ama bunu belli etmeden
- **Zor bağlam yapma:** Türkiye bağlantısı doğal geliyorsa yaz, değilse zorlama

### 2.3 Prompt Şablonları (`content/promptlar/`)

**Ne:** Kullanıma hazır, test edilmiş prompt'lar.
**Kadans:** Haftada 1-2.
**Uzunluk:** Prompt + açıklama toplam 500-1000 kelime.

| Alan | Kural |
|------|-------|
| `prompt` | Çalışan, test edilmiş prompt metni |
| `difficulty` | `baslangic` \| `orta` \| `ileri` |
| `targetRole` | Kimin için: `"Pazarlamacı"`, `"Geliştirici"` |
| `models` | Min 2 model skoru (test edilmiş) |
| `variables` | Değiştirilebilir yerler ve örnekleri |
| `commonMistakes` | Min 2 sık yapılan hata |

**Zorunlu Test Protokolü:**
1. Prompt'u en az 2 farklı modelde çalıştır
2. Her model için skor ver (1-10)
3. Varsa not ekle
4. commonMistakes'i gerçek deneyimden yaz

### 2.4 Model Kartları (`content/kartlar/`)

**Ne:** AI model ve araç bilgi kartları.
**Kadans:** Yeni model çıktığında + güncelleme olduğunda.

| Alan | Kural |
|------|-------|
| `type` | `model` \| `arac` |
| `company` | Şirket adı |
| `pricing` | Güncel fiyat (free, input, output) |
| `contextWindow` | Token sayısı |
| `benchmarks` | Min 3 benchmark (MMLU, HumanEval, MATH vb.) |
| `releaseDate` | İlk çıkış tarihi |

### 2.5 Haftalık Brifing (`content/haftalik/`)

**Ne:** Haftanın en önemli 3 AI gelişmesi + aksiyon.
**Kadans:** Her Cuma, o haftanın son iş günü yayınlanır.
**Dosya adı:** `YYYY-wWW.mdx` (örn: `2026-w07.mdx`)

| Alan | Kural |
|------|-------|
| `weekNumber` | ISO hafta numarası |
| `highlights` | Tam 3 adet, her birinde `title`, `summary`, `url` |
| `weeklyAction` | 1 somut, test edilebilir eylem |

**Brifing Body Yapısı:**
```
## Bu Hafta Neler Oldu?         ← Genel bağlam (1-2 cümle)
### 1. [Highlight 1 Başlığı]    ← Detay + "beyaz yakalılar için anlam"
### 2. [Highlight 2 Başlığı]    ← Detay + "beyaz yakalılar için anlam"
### 3. [Highlight 3 Başlığı]    ← Detay + "beyaz yakalılar için anlam"
## Haftanın Sayıları             ← 3-5 adet istatistik
```

---

## 3. Dosya Adlandırma Kuralları

```
content/
├── yazilar/
│   └── {slug}.mdx              → chatgpt-vs-claude-2026.mdx
├── haberler/
│   └── {slug}.mdx              → openai-gpt-5-2-duyuru.mdx  
├── promptlar/
│   └── {slug}.mdx              → swot-analizi-promptu.mdx
├── kartlar/
│   └── {slug}.mdx              → claude-opus-4.mdx
└── haftalik/
    └── {YYYY}-w{WW}.mdx        → 2026-w07.mdx
```

**Slug Kuralları:**
- Sadece küçük harf İngilizce karakterler ve tire
- Türkçe karakter KULLANMA (ş→s, ç→c, ğ→g, ı→i, ö→o, ü→u)
- Maksimum 60 karakter
- Tarih ekleme (URL'yi uzatır, SEO'ya zarar verir) — istisnası: yıl bazlı karşılaştırmalar (ör: `...-2026`)

---

## 4. İçerik Üretim İş Akışı

### Adım 1: Kaynak Toplama (Günlük — 15 dk)

```bash
# Haber toplayıcıyı çalıştır
cd ai-haber-takip
node haberler.mjs --limit 5

# Veya JSON olarak kaydet
node haberler.mjs --json --limit 5
```

Çıktıları tara ve önemli haberleri işaretle.

### Adım 2: İçerik Seçimi (Karar Matrisi)

Her potansiyel içerik için şu soruları sor:

| Soru | Evet = Yaz | Hayır = Atla |
|------|-----------|-------------|
| Türkiye'deki beyaz yakalılar için pratik değeri var mı? | ✓ | — |
| 48 saat içinde hâlâ geçerli olacak mı? | ✓ | (Haber ise yazılabilir) |
| Benzersiz bir bakış açısı sunabilir miyiz? | ✓ | — |
| En az 1 birincil kaynak var mı? | ✓ | ⚠️ Speculative olarak yaz |
| Rakiplerimiz bunu Türkçe yazdı mı? (yoksa fırsat) | Yaz! | Daha iyi yaz |

### Adım 3: İçerik Scaffolding

```bash
# Yeni yazı oluştur
npm run new:yazi

# Yeni haber oluştur
npm run new:haber

# Yeni prompt oluştur
npm run new:prompt

# Yeni model kartı oluştur
npm run new:kart

# Yeni haftalık brifing oluştur
npm run new:haftalik
```

Bu komutlar interaktif olarak sorar ve hazır MDX dosyası oluşturur.

### Adım 4: Yazım

**Temel Kurallar:**
1. **İlk cümle hook olmalı** — okuyucu neden devam etsin?
2. **Jargonsuz yaz** — "fine-tuning" yerine "ince ayar" de, sonra parantez içinde terim ver
3. **Her H2'den sonra max 3 paragraf** — sonra yeni H2 veya liste
4. **Aksiyon odaklı bitir** — "bu bilgiyle ne yapacağım?" sorusunu yanıtla
5. **Karşı görüş ekle** (yazılarda) — güven artırır

**Ton ve Ses:**
- Profesyonel ama samimi ("abi" değil, "siz" formatı)
- Spekülatif bilgiyi açıkça belirt: *"Doğrulanmamış bilgilere göre..."*
- Kaynak göster, her zaman
- Türkçe önce, teknik terim parantezde: "büyük dil modeli (LLM)"

### Adım 5: Kalite Kontrolü (Yayın Öncesi Checklist)

İçerik yayınlanmadan önce aşağıdaki kontrol listesini tamamla:

```
□ Frontmatter tüm zorunlu alanları içeriyor
□ Title ≤ 70 karakter
□ Description ≤ 160 karakter
□ Keywords = 6 adet (5 spesifik + "yapay zeka haberleri")
□ En az 1 kaynak (sources) var ve URL'si çalışıyor
□ confidence doğru ayarlanmış
□ lastFactChecked bugünün tarihi (yazılarda)
□ Body minimum kelime sayısını karşılıyor
□ H2 başlıklar mantıklı sırada
□ Kod blokları ve tablolar doğru render oluyor
□ Slug kurallarına uygun (Türkçe karakter yok)
□ velite build hatasız tamamlanıyor
□ Sayfa tarayıcıda doğru görünüyor
□ OG image oluşuyor (/api/og?title=...) 
```

### Adım 6: Build & Doğrulama

```bash
# 1. Velite build (içerik derleme)
npx next build --webpack

# 2. Lokal test
npm run dev

# 3. Build başarılıysa deploy
```

---

## 5. Editoryal Takvim & Çalışma Programı

### Çalışma Penceresi

| Zaman Dilimi | Aktivite |
|--------------|----------|
| **08:00–18:00** (iş saatleri) | LinkedIn + haber taraması, içerik fikirleri toplama |
| **20:00–21:00** | İçerik tartışma, konu seçimi, scaffold oluşturma |
| **21:00–22:30** | İçerik yazımı, düzenleme, kalite kontrol |
| **22:30–23:00** | Build, test, yayınlama, sosyal medya paylaşımı |

### Haftalık Editoryal Takvim

| Gün | Yayın Tipi | Detay |
|-----|-----------|-------|
| **Pazartesi** | Haber (1-2) | Geçen haftasonundan önemli gelişmeler |
| **Salı** | Yazı | Rehber veya analiz yazısı |
| **Çarşamba** | Haber (1-2) | Hafta ortası gelişmeler |
| **Perşembe** | Prompt + Haber | Yeni prompt şablonu + günlük haber |
| **Cuma** | Haftalık Brifing | Haftanın özeti + bülten gönderimi |
| **Cumartesi** | (Opsiyonel) | Model kartı güncelleme veya ek yazı |
| **Pazar** | Planlama | Gelecek hafta konu planlaması |

**Minimum Haftalık Hedef:** 2 yazı + 3 haber + 1 prompt + 1 brifing = **7 içerik**

### İçerik Kaynak Toplama Sistemi

**LinkedIn Tarama (İş Saatlerinde):**
1. AI liderlerini takip et (Sam Altman, Dario Amodei, Sundar Pichai, Yann LeCun)
2. İlginç post/paylaşım gördüğünde kısa not al (başlık + link)
3. Akşam bu notları AI ajanıyla tartışarak içeriğe çevir

**Haber Toplayıcı (Otomatik):**
```bash
node ai-haber-takip/haberler.mjs --limit 10
```

**Kaynak Öncelik Sırası:**
1. Resmi şirket blogları (OpenAI, Google, Anthropic)
2. LinkedIn lider paylaşımları
3. TechCrunch, The Verge, MIT Tech Review
4. Türkçe kaynaklar (Webrazzi, Webtekno)
5. arXiv / Hugging Face (araştırma)

---

## 6. YENİ YAZI YAYINLAMA — TAM PIPELINE

Bu bölüm bir editör + SEO + GEO mühendisinin her yeni içerik yayınlarken
eksiksiz yapması gereken tüm adımları kapsar.

### AŞAMA 1: İçerik Hazırlama (MDX Dosyası)

#### Frontmatter Kontrol Listesi
```
□ title: Max 70 karakter, ana keyword başta
         Google 60'ta keser → ilk 60 karaktere en önemli bilgiyi sığdır
         Örnek: "OpenAI 100 Milyar Dolarlık Anlaşmayı Sonlandırıyor"

□ slug:  Türkçe karakter YOK (ş→s, ç→c, ğ→g, ı→i, ö→o, ü→u)
         Kısa ve SEO-uyumlu, max 60 karakter
         Örnek: openai-100-milyar-dolar-850-milyar-degerleme

□ description: 120-160 karakter arası (Google 155-160'ta keser)
               Ana keyword + tamamlayıcı bilgi
               Bu metin Google SERP'te görünür — her kelimesi önemli

□ date: Bugünün tarihi (YYYY-MM-DD)

□ sourceUrl: Orijinal haberin URL'si (çalıştığını kontrol et)

□ sourceName: Kaynak adı (OpenAI Blog, TechCrunch, vb.)

□ category: sirketler | sektor | turkiye | arastirma

□ keywords (6 adet):
   1. Ana keyword (en spesifik, long-tail)
   2-5. İlgili secondary keyword'ler
   6. "yapay zeka haberleri" (HER ZAMAN — generic TR SEO keyword)
   
   Keyword Seçim Kuralları:
   - Türkçe düşün → Google'da Türk kullanıcı ne arar?
   - Mümkünse İngilizce terim + Türkçe bağlam: "openai yatırım"
   - Long-tail tercih et: "gemini 3.1 pro" > "google ai"
   - Rakip analizi: O haberi Google'da ararsan ne yazarsın?

□ sources: Min 1, ideal 2+ kaynak
   - tier 1: Resmi blog, API docs, akademik makale
   - tier 2: CEO/CTO paylaşımı, Reuters, Bloomberg, TechCrunch
   - tier 3: Sızıntı, anonim kaynak, forum

□ confidence: high | medium | speculative

□ socialSnippet: Max 280 karakter (Twitter/X paylaşım metni)

□ published: true (UNUTMA — false bırakırsan sayfada görünmez)
```

#### Body İçerik Kuralları
```
□ İlk cümle: Kim + ne yaptı + ne zaman (hook)
□ İlk paragrafta ana keyword doğal şekilde geçmeli
□ Teknik terimler anlatım içinde açıklanmalı
   (ör: "büyük dil modeli (LLM)" veya "ince ayar (fine-tuning)")
□ Türkiye bağlantısı doğal geliyorsa ekle, zorlama
□ Min 300, ideal 500-800 kelime
□ Bold (**) kullan: şirket adları, rakamlar, önemli kavramlar
□ Sabit başlık şablonu KULLANMA (Ne Oldu / Neden Önemli / Türkiye İçin YOK)
□ Paragraflar arası doğal geçiş, maddeler yerine düz yazı tercih et
```

### AŞAMA 2: SEO Doğrulama

#### Google SERP Kontrolü
```
□ Title Google'da nasıl görünecek? (60 karakterde kesilmiyor mu?)
□ Description snippet'te nasıl görünecek? (155-160 karakter sınırı)
□ Slug kısa ve açık mı? URL'yi biri görünce konuyu anlar mı?
□ OG Image oluşuyor mu? → /api/og?title=BASLIK_BURAYA
```

#### On-Page SEO
```
□ Title'da ana keyword var
□ Description'da ana keyword var
□ Body ilk paragrafında ana keyword geçiyor
□ Bold ile vurgulanan önemli kavramlar var
□ Min 1 internal link (başka bir habere/yazıya atıf)
□ Min 1 external link (kaynak URL zaten var)
□ "yapay zeka haberleri" keyword'ü 6. sırada ekli
```

#### Structured Data (Otomatik — Kod Kontrol)
Bunlar otomatik üretiliyor ama bilmen gereken:
- NewsArticle JSON-LD: title, description, dates, author, publisher, citation, speakable
- BreadcrumbList JSON-LD: Ana Sayfa → Haberler → [Başlık]
- OG tags: article:author, article:section, article:tags
- Canonical URL: /haberler/{slug}
- Twitter Card: summary_large_image

### AŞAMA 3: GEO (Generative Engine Optimization)

#### llms.txt Güncelleme
```
□ public/llms.txt dosyasına yeni haber eklendi mi?
   Format:
   - [Başlık](https://airehber.com/haberler/slug): Kısa açıklama
   
   Bu dosya ChatGPT, Claude, Gemini'nin siteyi tanıması için kritik.
   Her yeni içerik yayınladığında bu dosyayı güncelle.
```

#### LLM Dostu İçerik
```
□ Haberin ilk cümlesi tam bir özet mi? (LLM'ler genellikle ilk paragrafı alır)
□ Rakamlar ve veriler açıkça yazılmış mı? ("100 milyar dolar", "397B parametre")
□ Şirket adları tam yazılmış mı? ("OpenAI", "Google DeepMind" — kısaltma değil)
□ Tarih bağlamı var mı? ("Şubat 2026'da", "bu hafta")
```

### AŞAMA 4: Build & Test

```bash
# 1. Velite content build
npx velite --clean
# → Hata varsa frontmatter'ı kontrol et

# 2. (Opsiyonel) Local dev server
npm run dev
# → Sayfayı tarayıcıda kontrol et: http://localhost:3000/haberler/SLUG

# 3. Git commit & push
git add -A
git commit -m "feat(haberler): BASLIK"
git push origin main
# → Vercel otomatik deploy eder
```

### AŞAMA 5: Post-Publish Aksiyonlar

```
□ Google Search Console → "URL Denetleme" → URL yapıştır → "Dizine eklenmesini iste"
  (Günde max 10 URL yapabilirsin, en önemli haberlere öncelik ver)

□ Sosyal medya paylaşımı:
  - LinkedIn: socialSnippet + haber linki
  - Instagram: Story veya carousel
  - (Opsiyonel) Twitter/X

□ Site haritası otomatik güncellenir (sitemap.xml + news-sitemap.xml)
□ İlgili Haberler bölümü otomatik güncellenir (aynı kategori/keyword)
□ Ana sayfa hero/son haberler otomatik güncellenir
```

### HIZLI REFERANS KARTI

| Alan | Limit | Kontrol |
|------|-------|---------|
| title | ≤ 70 karakter | Google 60'ta keser |
| slug | ≤ 60 karakter | Türkçe karakter YOK |
| description | 120-160 karakter | Google 155-160'ta keser |
| keywords | 6 adet | Son sıra: "yapay zeka haberleri" |
| sources | min 1 | URL çalışıyor mu? |
| socialSnippet | ≤ 280 karakter | Twitter/X formatı |
| body | 300-800 kelime | İlk cümle hook, ilk paragraf keyword |
| published | true | false = sayfada görünmez |
| llms.txt | güncelle | Her yeni içerikte |

---

## 7. Güven Katmanı (Trust Layer)

AI Rehber'in farkı **güven sistematiğidir.** Her içerik için:

### 7.1 Kaynak Doğrulama
- Birincil kaynağı mutlaka kontrol et (resmi blog, API docs)
- Haber 2+ bağımsız kaynak tarafından doğrulanmalı
- Doğrulanamayan bilgiyi `confidence: speculative` işaretle

### 7.2 Düzeltme Politikası
- Hata tespit edildiğinde düzelt + `corrections` alanına kaydet
- Düzeltme şeffaftır, gizlenmez

### 7.3 Güncellik Takibi
- 7 günden eski → "Güncel" rozeti
- 30 günden eski → "Kontrol Gerekli" rozeti
- 30+ gün → "Eskimiş Olabilir" rozeti

---

## 8. Haber Toplama → MDX Pipeline

Haber toplayıcıdan içerik üretme adımları:

```
1. node haberler.mjs --json     → JSON çıktı alır
2. JSON'dan önemli haberleri seç
3. npm run new:haber            → interaktif scaffold
4. İçeriği yaz (doğal akıcı anlatım, şablon başlık kullanma)
5. Kaynak doğrula (URL'ler çalışıyor mu?)
6. npx next build --webpack     → build test
7. npm run dev                  → görsel kontrol  
8. Commit & deploy
```

---

## 9. Dosya → Sayfa Eşleştirme Tablosu

| İçerik Dosyası | URL | Sayfa |
|----------------|-----|-------|
| `content/yazilar/{slug}.mdx` | `/yazilar/{slug}` | Yazı detay |
| `content/haberler/{slug}.mdx` | `/haberler/{slug}` | Haber detay |
| `content/promptlar/{slug}.mdx` | `/prompt-kutuphanesi/{slug}` | Prompt detay |
| `content/kartlar/{slug}.mdx` | `/modeller/{slug}` | Model detay |
| `content/haftalik/{YYYY-wWW}.mdx` | `/haftalik/{slug}` | Brifing detay |

**Otomatik oluşan sayfalar:**
- `/` → Anasayfa (son yazı + son 3 haber + keşfet)
- `/yazilar` → Tüm yazılar listesi
- `/haberler` → Tüm haberler listesi
- `/prompt-kutuphanesi` → Tüm promptlar listesi
- `/modeller` → Tüm model kartları listesi
- `/haftalik` → Tüm brifinglerin listesi
- `/zaman-cizelgesi` → Haberler + editoryal timeline
- `/arama` → Site içi arama
- `/feed.xml` → RSS feed (yazılar + haberler)
- `/sitemap.xml` → Tüm URL'ler (otomatik)

---

## 10. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| Velite build hatası | Frontmatter YAML formatını kontrol et. Tire (—) değil, tire (-) kullan |
| Slug hata veriyor | Türkçe karakter var mı kontrol et |
| OG image oluşmuyor | `?title=` parametresinde `+` ile boşluk kullan |
| Sayfa 404 veriyor | `published: true` olduğundan emin ol |
| Description çok uzun | Max 160 karakter, Velite zorunlu kılıyor |
| Kaynak URL bozuk | Build'den önce tüm URL'leri test et |

---

## 11. E-posta Bülten Stratejisi

### Gönderim Bilgileri
- **Gönderen:** can@airehber.com (Outlook üzerinden)
- **Kadans:** Haftada 1 — Cuma akşamı (Haftalık Brifing ile eş zamanlı)
- **Konu formatı:** `AI Haftalık #WW — [En dikkat çekici highlight]`

### Bülten İçerik Yapısı
```
Başlık: AI Haftalık #WW
──────────────────────
1. Bu hafta [kısa genel özet]

📌 Öne Çıkanlar
  1. [Highlight 1] — 2 cümle + link
  2. [Highlight 2] — 2 cümle + link
  3. [Highlight 3] — 2 cümle + link

🎯 Bu Hafta Ne Yapmalısınız?
  [weeklyAction]

📖 Bu Hafta Yayınladıklarımız
  - [Yazı başlığı](link)
  - [Haber başlığı](link)
  - [Prompt başlığı](link)

──────────────────────
AI Rehber | airehber.com
Abonelikten çıkmak için: [link]
```

### Abone Toplama Kanalları
1. **Site içi form** — NewsletterForm bileşeni zaten mevcut
2. **LinkedIn paylaşımları** — "Bültenimize abone olun" CTA
3. **Google firma verileri** — Hedef sektör firmaları mail listesi
4. **İçerik sonları** — Her yazının altında bülten CTA

### Abone Büyütme Hedefleri
| Hafta | Hedef Abone |
|-------|-------------|
| 1-4 | 0 → 50 |
| 5-12 | 50 → 200 |
| 13-26 | 200 → 1000 |

---

## 12. Mobil Strateji

### Mevcut Durum
- Next.js sitesi responsive (Tailwind `sm:`, `md:` breakpoint'leri)
- Mobil web deneyimi zaten çalışıyor

### Kısa Vade (0-3 ay)
- **PWA (Progressive Web App)** desteği ekle
  - `manifest.json` oluştur
  - Service worker ile offline okuma
  - "Ana ekrana ekle" özelliği
  - Push notification altyapısı (bülten bildirimi)

### Orta Vade (3-6 ay) — Değerlendirme
- İçerik hacmi ve trafik verilerine göre:
  - **React Native** ile native app (Expo)
  - Veya **Capacitor** ile hybrid app
  - Veya PWA yeterli kalır (en muhtemel)

### Karar Kriterleri
| Kriter | PWA Yeterli | Native Gerekli |
|--------|-------------|----------------|
| Haftalık aktif kullanıcı | < 5K | > 5K |
| Push notification ihtiyacı | Temel | Gelişmiş |
| Offline kullanım | Makaleler | Tam deneyim |
| Monetizasyon | Reklam/bülten | Premium üyelik |

---

## 13. Commit & Arşiv Sistemi

### Commit Mesajı Formatı
```
<tip>(<kapsam>): <açıklama>

Tipler: feat, fix, content, refactor, docs, style, chore
Kapsam: yazilar, haberler, promptlar, kartlar, haftalik, ui, seo, infra
Dil: Türkçe
```

### Örnekler
```
feat(haberler): OpenAI GPT-5.2 haberi eklendi
fix(ui): footer link düzeltmesi
content(yazilar): ChatGPT vs Claude karşılaştırması güncellendi
refactor(infra): timeline verisi ayrı dosyaya taşındı
docs(system): CONTENT_SYSTEM.md güncellendi
chore(deps): Next.js 16.2 güncelleme
```

### Changelog
Her oturum sonunda `CHANGELOG.md` dosyası güncellenir:
- Tarih + oturum numarası
- Eklenen, değiştirilen, düzeltilen öğeler
- AI ajanı bu dosyayı okuyarak geçmişi anlayabilir
