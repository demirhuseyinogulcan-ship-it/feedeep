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

> **KURAL:** Sabit başlık şablonu ("Ne Oldu? / Neden Önemli? / Türkiye İçin") KULLANILMAZ.
> Bu kalıplar AI çıktısını ele verir, okuyucu 3 saniyede fark edip çıkar.
> Bunun yerine Hook → Retention → Reward sistemini kullan (Bölüm 7'ye bak).

Haberler doğal, akıcı, gazetecilik diline uygun yazılır:
- **Hook ile başla:** İlk cümle pattern interrupt, open loop veya specificity hook olmalı
- **Akıcı anlatım:** Paragraflar birbiriyle doğal geçişlerle bağlanır, maddeler yerine düz yazı tercih edilir
- **Eğitici ama çaktırmadan:** Teknik kavramlar anlatımın içinde doğal biçimde açıklanır
- **İnsan sesi:** Kısa cümleler + uzun cümleler karıştır, soru sor, gerilim yarat
- **Zeigarnik hook:** Her paragrafın sonunda bir sonrakini okutacak mini-geçiş bırak

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

### 2.4 Haftalık Brifing (`content/haftalik/`)

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
| **Cumartesi** | (Opsiyonel) | Ek yazı veya serisel içerik |
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
| `content/haftalik/{YYYY-wWW}.mdx` | `/haftalik/{slug}` | Brifing detay |

**Otomatik oluşan sayfalar:**
- `/` → Anasayfa (son yazı + son 3 haber + keşfet)
- `/yazilar` → Tüm yazılar listesi
- `/haberler` → Tüm haberler listesi
- `/prompt-kutuphanesi` → Tüm promptlar listesi
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
Kapsam: yazilar, haberler, promptlar, haftalik, ui, seo, infra
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

---

## 14. İnsan Yazım Tonu (AI Algısını Kırma Kuralları)

> **Bu bölüm tüm AI ajanlarının içerik üretirken ZORUNLU uygulaması gereken kurallardır.**
> Amaç: Okuyucu yazıyı okuduğunda "bunu bir insan yazmış" hissetmeli.
> AI tarafından üretildiği anlaşılan içerik, ne kadar iyi olursa olsun okunmaz.

### 14.0.1 Perspektif: Platform Sesi

AI Rehber bir kişisel blog değil, bir yayın platformu. Yazım tonu buna göre ayarlanır.

```
YAPMA                                    YAP
─────                                    ───
"Geçen hafta şunu fark ettim..."        → "GitHub verilerine göre..."
"Gözüme takılan bir rakam var"          → "Dikkat çeken bir veri var"
"Bence şöyle olacak"                    → "Veriler şöyle bir tablo çiziyor"
"Ben", "benim", "bana"                  → Nötr anlatım veya yumuşak "biz"
"Sizin için araştırdık!"               → Direkt bilgiyi ver
```

Platform sesi: ne soğuk kurumsal ne de kişisel günlük. Bilgi veriyor ama sıkıcı değil. Kahvede akıllı bir arkadaşınla konuşur gibi ama o arkadaş kendinden bahsetmiyor, konudan bahsediyor.

### 14.0.2 Noktalama ve Biçim: Minimum İşaret

Türkçe günlük yazımda insanlar çok az noktalama işareti kullanır. AI ise em dash, üç nokta, ünlem, tırnak işaretlerini abartır.

```
YAPMA                                    YAP
─────                                    ───
Cümle — ve devamı — böyle              → Cümle, ve devamı böyle
"kelime" (her şeyi tırnağa alma)       → Sadece alıntı ve özel terimde tırnak
Vurgu! Her yerde! Ünlem!               → Ünlem neredeyse hiç kullanma
Üç nokta ile bitir...                  → Noktayla bitir.
**Her** **üçüncü** **kelime** bold     → Sadece rakamlar ve şirket adları bold
"İşte tam da bu noktada..."            → Doğal bağlaç: "ama", "o yüzden", "bir de"
```

### 14.0.3 Paragraf Asimetrisi

AI her paragrafı aynı uzunlukta yazar. İnsan yazmaz. Bazı paragraflar tek cümle, bazıları beş cümle olmalı.

```
✅ DOĞRU:
"Dokuz kat hızlanma."                              ← tek cümle paragraf
"Trendyol bunu 2 bin kişilik ekiple yaptı.         ← 3 cümle paragraf
Son altı ayda 4 binden fazla görev AI tarafından
tamamlandı. Lojistikte yüzde 20 verimlilik artışı var."

❌ YANLIŞ:
Her paragraf 3 cümle. Her bölüm eşit.
Her geçiş aynı kalıpta. Simetrik yapı.
```

### 14.0.4 Geçiş Cümleleri

AI "İşte tam da bu noktada", "Peki neden önemli?", "Hadi birlikte bakalım" gibi sahte geçişler kullanır. İnsan günlük Türkçe bağlaçlarıyla geçiş yapar.

```
YAPMA                                    YAP
─────                                    ───
"İşte tam da bu noktada"               → "Ama"
"Şimdi gelin birlikte bakalım"         → (geçiş cümlesi koyma, direkt yaz)
"Peki neden bu önemli?"                → "O yüzden"
"Hadi bunu daha yakından inceleyelim"  → "Bir de şu var:"
"Sonuç olarak"                         → "Kısacası" veya geçiş cümlesi koyma
```

### 14.0.5 Cümle Çeşitliliği

AI hep aynı yapıda cümle kurar. İnsan kısa ve uzun cümleleri karıştırır, bazen soru sorar, bazen eksik bırakır.

```
❌ YANLIŞ (hep aynı yapı):
"OpenAI yeni bir model duyurdu. Bu model çok güçlü. Performansı rekor kırdı."

✅ DOĞRU (karışık yapı):
"OpenAI yeni modelini duyurdu. Performans rakamları rekor
seviyede ama asıl ilginç olan şirketin bu modeli neden
sessizce yayınladığı."
```

### 14.0.6 Hedging ve Kesinlik

AI "olabilir", "değerlendirilebilir", "söylenebilir" gibi hedge ifadeler kullanmayı sever. İnsan daha net konuşur. Emin olunmayan yerde de net biçimde emin olmadığını söyler.

```
YAPMA                                    YAP
─────                                    ───
"Bu durum şirketler için önemli        → "Bu şirketleri doğrudan etkiliyor"
 olabilir"
"Söz konusu gelişme sektörü            → "Sektörü sarsacak bir gelişme"
 etkileyebilir"
"İlgili verilere göre bir artış        → "Veriler net: yüzde 55 büyüme var"
 gözlemlenmektedir"
```

Emin olunmayan durumlarda: "Henüz doğrulanmadı ama..." veya "Rakamlar kesin değil" gibi net bir belirsizlik ifadesi kullan. Pasif hedge yapma.

### 14.0.7 Kontrol Listesi (Her İçerik Yayınlanmadan Önce)

İçerik yazıldıktan sonra şu soruları sor:
```
□ "Ben/benim" ifadesi var mı? Varsa çıkar.
□ 3'ten fazla em dash (—) var mı? Azalt.
□ Her paragraf aynı uzunlukta mı? Bazılarını kısalt veya uzat.
□ "İşte tam da" veya "Peki neden" gibi AI geçişi var mı? Değiştir.
□ Her üçüncü kelime bold mu? Sadece rakam ve şirket adlarını bırak.
□ Ünlem işareti var mı? Neredeyse hiç olmamalı.
□ Cümleler hep aynı uzunlukta mı? Kısa-uzun karıştır.
□ Yazıyı sesli okusan doğal mı duyuluyor?
□ Bir arkadaşına anlatsan böyle mi anlatırsın?
```

---

## 15. Dikkat Psikolojisi & İçerik Mühendisliği

> **Bu bölüm tüm içerik üretiminde ZORUNLU kurallardır.**
> Her haber, yazı ve brifing bu framework'e göre yazılır.

### 15.1 HOOK — İlk 3 Saniye (Okuyucuyu Yakala)

Okuyucu ilk 3 saniyede kalıp kalmayacağına karar verir. 5 hook tekniğinden EN AZ birini kullan:

| Teknik | Açıklama | Örnek |
|--------|----------|-------|
| **Pattern Interrupt** | Beklentiyi kır, şok et | "Google kendi AI modelini öldürdü." |
| **Open Loop** | Merak boşluğu bırak, cevabı geciktir | "OpenAI'ın gizlice geliştirdiği model, hiç kimsenin tahmin etmediği bir şey yapıyor." |
| **Specificity Hook** | Somut rakam/detay ver | "Tam 47 saniyede 10.000 satır kod yazdı." |
| **Identity Hook** | Okuyucunun kimliğine seslen | "Eğer hâlâ ChatGPT'yi sadece sohbet için kullanıyorsan, geride kalıyorsun." |
| **Controversy Hook** | Tartışma başlat | "AI uzmanlarının %60'ı yanılıyor olabilir." |

**YAPMA → YAP:**
```
❌ YAPMA: "OpenAI yeni bir model duyurdu. Bu model GPT-5 adını taşıyor."
✅ YAP:   "GPT-5 sessizce geldi — ve ilk testlerde insanları yenen tek model oldu."

❌ YAPMA: "Google DeepMind yeni bir araştırma yayınladı."
✅ YAP:   "DeepMind'ın 3 yıldır gizlediği proje, bilim dünyasını ikiye böldü."

❌ YAPMA: "Türkiye'de yapay zeka kullanımı artıyor."
✅ YAP:   "İstanbul'da bir lise öğrencisi, AI ile 2 haftada 50.000 TL kazandı."
```

### 15.2 RETENTION — Okuyucuyu Yazının İçinde Tut

Hook'tan sonra okuyucu kaçmamalı. 3 teknikle tut:

#### A) Zeigarnik Etkisi (Tamamlanmamış Görev)
Beyni "sonucu öğrenmek" için yazıda tutarsın:
```
"Ama asıl bomba haberi henüz söylemedim..."
"Bunun neden önemli olduğunu birazdan göreceksin."
"3 kritik detay var — üçüncüsü her şeyi değiştiriyor."
```

#### B) Information Gap (Bilgi Boşluğu)
Bildiklerini hatırlat → bilmediklerini hissettir:
```
"ChatGPT'yi biliyorsun. Ama GPT-5'in gizli özelliğini duydun mu?"
"Herkes AI'ın hızlı olduğunu biliyor. Kimse neden bazen yanlış yaptığını sormuyor."
```

#### C) Nested Loops (İç İçe Döngüler)
Bir hikayeyi aç → ikincisine geç → ilkini sonra kapat:
```
"Google'ın planını anlatmadan önce, küçük bir detay var..."
[başka konu]
"Şimdi Google'a dönelim — işte tam da bu yüzden..."
```

### 15.3 REWARD — Okuyucuyu Ödüllendir

Her içerik okuyucuya 3 ödül tipinden EN AZ birini vermeli:

| Ödül Tipi | Açıklama | Uygulanışı |
|-----------|----------|------------|
| **Kabile Ödülü** | "Ben bu topluluğun parçasıyım" hissi | "AI Rehber takipçileri bunu çoktan biliyordu." |
| **Av Ödülü** | "Değerli bilgiyi yakaladım" hissi | Somut veri, istatistik, insider bilgi paylaş |
| **Benlik Ödülü** | "Kendimi geliştirdim" hissi | Pratik ipucu, prompt önerisi, uygulanabilir adım ver |

### 15.4 INVESTMENT — Okuyucuyu Geri Getir

Okuyucu emek verirse geri döner. Her yazının sonunda EN AZ biri olmalı:

- **Seri İpucu:** "Yarın bu modelin Türkiye testini yayınlıyoruz."
- **Soru:** "Sen bu konuda ne düşünüyorsun? Bize yaz."
- **Araç/Kaynak:** "Bu prompt'u hemen dene: [...]"
- **FOMO:** "Bu bilgiyi bilen 1000 kişiden biri oldun."
- **Bülten CTA:** "Her sabah AI dünyasının özetini al → [bülten]"

### 15.5 Başlık Psikolojisi Şablonları

Her başlık aşağı formüllerden birine uymalıdır:

| Formül | Pattern | Örnek |
|--------|---------|-------|
| **Rakam + Sıfat + Anahtar** | [Rakam] [Güçlü Sıfat] [Konu] | "5 Şok Edici GPT-5 Özelliği" |
| **Nasıl + Fayda** | [Konu] Nasıl [Fayda Sağlar] | "AI Agent'lar Kodlamayı Nasıl 10x Hızlandırıyor" |
| **Neden + Gerilim** | [Konu] Neden [Şaşırtıcı Sonuç] | "Google Neden Kendi AI'ını Kapatıyor" |
| **X vs Y** | [A] vs [B]: [Sonuç] | "GPT-5 vs Claude 4: Kazanan Belli Oldu" |
| **Gizli/Bilinmeyen** | [Kaynağın] Gizli [Şeyi] | "OpenAI'ın Gizlediği 3 Kritik Detay" |
| **Soru + Provokasyon** | [Provokatif Soru]? | "AI Geliştiricileri İşsiz mi Kalacak?" |

**Başlık Kontrol Listesi:**
- [ ] Rakam veya somut detay var mı?
- [ ] Merak boşluğu yaratıyor mu?
- [ ] 60 karakterden kısa mı? (Google SERP)
- [ ] Anahtar kelime ilk 3 kelimede mi?
- [ ] Clickbait DEĞİL ama tıklanası mı?

### 15.6 Sosyal Medya → Site Döngüsü

Her haber yayınlandığında 3 katmanlı paylaşım:

```
1. HOOK POST (Twitter/X, LinkedIn):
   → Haberin en şok edici cümlesini al
   → "Devamı airehber.com'da 👆" ile bitir
   → Link preview'da güçlü başlık görünmeli

2. THREAD/CAROUSEL:
   → Haberin 3-4 kilit noktasını özetle
   → Her slide/tweet sonunda merak boşluğu
   → Son slide: "Tam analiz → [link]"

3. COMMUNITY POST:
   → Tartışma sorusu sor
   → Okuyucu yorumlarına yanıt ver
   → En iyi yorumu sonraki haberde referans ver
```

### 15.7 Bağımlılık Mekanizması (Rutin Oluşturma)

Okuyucuyu tek seferlik ziyaretçiden düzenli takipçiye çevirme stratejisi:

| Mekanizma | Uygulama |
|-----------|----------|
| **Sabit Zaman** | Her gün aynı saatte (09:00) yeni içerik |
| **Seri İçerik** | "AI Haftalık Brifing" → her Pazartesi beklenti |
| **İlerleme Hissi** | "Bu hafta 5 haberin 3'ünü okudun" (gelecek feature) |
| **Kayıp Korkusu** | "Dünün en çok okunan haberi: [...]" |
| **Topluluk** | Okuyucu yorumları, anketler, geri bildirim |

### 15.8 Yazım Stili Kuralları (Tüm İçerikler)

```
YAPMA                                    YAP
─────                                    ───
"Bu yazıda X'i inceleyeceğiz"          → Direkt hook ile başla
"Sonuç olarak..."                       → "İşte tam da bu yüzden..."
"Önemle belirtmek gerekir ki..."       → Kısa. Net. Vur.
Pasif cümle: "Duyuruldu"               → Aktif: "OpenAI duyurdu"
5+ satır paragraf                       → Max 3 satır, sonra boşluk
Jargon açıklamasız                      → Parantez içi 1 cümle açıklama
"Yapay zeka teknolojisi alanında..."    → "AI dünyasında..."
Aynı cümle yapısı tekrarı              → Kısa + Uzun + Soru karıştır
```

**Ritim Kuralı:** Her 3 paragrafta bir "kırılma" olmalı:
- Tek satırlık vurgu cümlesi
- Soru
- Mini liste (3 madde max)
- Rakam/istatistik vurgusu

> **SON SÖZ:** Bu framework'ün amacı manipülasyon değil,
> değerli bilgiyi okuyucuya ulaştırabilmektir.
> İyi bilgi + kötü sunum = kimse okumaz.
> İyi bilgi + iyi sunum = herkes öğrenir.
