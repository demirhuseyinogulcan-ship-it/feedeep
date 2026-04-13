# feedeep — İçerik Mühendisliği Sistemi

> Bu belge, feedeep'in içerik üretim, yayınlama ve kalite kontrol süreçlerini
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

**Ne:** İnceleme, analiz, karşılaştırma yazıları.
**Kadans:** Haftada minimum 2, hedef 3.
**Uzunluk:** Minimum 800 kelime, ideal 1500-3000 kelime.

| Alan | Kural | Örnek |
|------|-------|-------|
| `title` | Max 70 karakter, SEO odaklı, Türkçe | `"ChatGPT vs Claude: 2026 Karşılaştırması"` |
| `slug` | Küçük harf, tire ile ayrılmış, Türkçe karakter YOK | `chatgpt-vs-claude-2026` |
| `description` | Max 160 karakter, Google snippet'i bu | `"İki modeli 7 kriterde test ettik."` |
| `date` | ISO format, yayın tarihi | `2026-02-15` |
| `category` | `inceleme` \| `analiz` \| `karsilastirma` | `karsilastirma` |
| `keywords` | Max 5, en spesifik olanı ilk sıraya | `["chatgpt vs claude", ...]` |
| `tags` | Hub sayfaları için normalize etiketler, `TAG_LABELS` haritasından seç | `["openai", "ai-model"]` |
| `faq` | Soru-cevap çiftleri, FAQ JSON-LD üretir | Aşağıya bak |
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
| `tags` | Hub etiketleri, `TAG_LABELS` haritasından seç |
| `faq` | Opsiyonel soru-cevap çiftleri (FAQ JSON-LD) |
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

---

## 3. Dosya Adlandırma Kuralları

```
content/
├── yazilar/
│   └── {slug}.mdx              → chatgpt-vs-claude-2026.mdx
├── haberler/
│   └── {slug}.mdx              → openai-gpt-5-2-duyuru.mdx
└── _templates/
    ├── haber-template.mdx
    └── yazi-template.mdx
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
```

Çıktıları tara ve önemli haberleri işaretle.

### Adım 2: İçerik Seçimi (Karar Matrisi)

| Soru | Evet = Yaz | Hayır = Atla |
|------|-----------|-------------|
| Pratik değeri var mı? | Yaz | — |
| 48 saat içinde hâlâ geçerli olacak mı? | Yaz | (Haber ise yazılabilir) |
| Benzersiz bir bakış açısı sunabilir miyiz? | Yaz | — |
| En az 1 birincil kaynak var mı? | Yaz | Speculative olarak yaz |

### Adım 3: İçerik Scaffolding

```bash
npm run new:haber    # Yeni haber oluştur
npm run new:yazi     # Yeni yazı oluştur
```

### Adım 4: Yazım

**Temel Kurallar:**
1. **İlk cümle hook olmalı** — okuyucu neden devam etsin?
2. **Jargonsuz yaz** — "fine-tuning" yerine "ince ayar" de, sonra parantez içinde terim ver
3. **Her H2'den sonra max 3 paragraf** — sonra yeni H2 veya liste
4. **Aksiyon odaklı bitir** — "bu bilgiyle ne yapacağım?" sorusunu yanıtla
5. **Karşı görüş ekle** (yazılarda) — güven artırır

**Ton ve Ses:**
- Profesyonel ama samimi
- Spekülatif bilgiyi açıkça belirt: *"Doğrulanmamış bilgilere göre..."*
- Kaynak göster, her zaman
- Türkçe önce, teknik terimi parantezle değil cümle içinde doğal açıkla
  - Kötü: "sosyal mühendislik (social engineering) saldırısı"
  - İyi: "Bu yönteme sosyal mühendislik deniyor. Teknik açık aramak yerine insanların güvenini hedef alıyor."

### Adım 5: Kalite Kontrolü (Yayın Öncesi Checklist)

```
□ Frontmatter tüm zorunlu alanları içeriyor
□ Title ≤ 70 karakter
□ Description ≤ 160 karakter
□ En az 1 kaynak (sources) var ve URL'si çalışıyor
□ confidence doğru ayarlanmış
□ Body minimum kelime sayısını karşılıyor
□ Slug kurallarına uygun (Türkçe karakter yok)
□ velite build hatasız tamamlanıyor
□ published: true
```

### Adım 6: Build & Doğrulama

```bash
npm run build    # validate + llms.txt + next build
npm run dev      # Lokal test
```

---

## 5. YENİ İÇERİK YAYINLAMA — TAM PIPELINE

### AŞAMA 1: İçerik Hazırlama (MDX Dosyası)

#### Frontmatter Kontrol Listesi — Haberler
```
□ title: Max 70 karakter, ana keyword başta
□ slug: Türkçe karakter YOK, max 60 karakter
□ description: 120-160 karakter
□ date: Bugünün tarihi (YYYY-MM-DD)
□ sourceUrl: Orijinal haberin URL'si
□ sourceName: Kaynak adı
□ category: sirketler | sektor | turkiye | arastirma
□ keywords (6 adet): Long-tail Türkçe, son sıra "yapay zeka haberleri"
□ tags: TAG_LABELS haritasından 1-4 etiket (bkz. Bölüm 13)
□ faq: Opsiyonel soru-cevap çiftleri (bkz. Bölüm 14)
□ sources: Min 1 (tier 1/2/3)
□ confidence: high | medium | speculative
□ socialSnippet: Max 280 karakter
□ published: true
```

#### Body İçerik Kuralları
```
□ İlk cümle: Kim + ne yaptı + ne zaman (hook)
□ İlk paragrafta ana keyword doğal şekilde geçmeli
□ Teknik terimler anlatım içinde açıklanmalı
□ Min 300, ideal 500-800 kelime (haberler); 800-3000 kelime (yazılar)
□ Sabit başlık şablonu KULLANMA
□ Paragraflar arası doğal geçiş
```

### AŞAMA 2: SEO Doğrulama

```
□ Title'da ana keyword var
□ Description'da ana keyword var
□ Body ilk paragrafında ana keyword geçiyor
□ Min 1 internal link (başka bir habere/yazıya atıf)
□ Min 1 external link (kaynak URL)
```

Structured Data otomatik üretilir: NewsArticle/Article JSON-LD, BreadcrumbList, OG tags, Twitter Card.

### AŞAMA 3: Build & Deploy

```bash
git add -A
git commit -m "feat(haberler): BASLIK"
git push origin main
# → Vercel otomatik deploy eder
```

### AŞAMA 4: Post-Publish

```
□ Google Search Console → URL Denetleme → Dizine ekleme iste
□ Sosyal medya paylaşımı (socialSnippet kullan)
□ Sitemap, news-sitemap, llms.txt otomatik güncellenir
```

---

## 6. Dosya → Sayfa Eşleştirme Tablosu

| İçerik Dosyası | URL | Sayfa |
|----------------|-----|-------|
| `content/yazilar/{slug}.mdx` | `/yazilar/{slug}` | Yazı detay |
| `content/haberler/{slug}.mdx` | `/haberler/{slug}` | Haber detay |

**Otomatik oluşan sayfalar:**
- `/` → Anasayfa (akış: son yazı + haberler)
- `/yazilar` → Tüm yazılar listesi
- `/haberler` → Tüm haberler listesi
- `/etiketler` → Tag indeks sayfası (tüm etiketler)
- `/etiketler/[tag]` → Tag hub sayfası (o etiketteki içerikler)
- `/arama` → Site içi arama
- `/hakkimizda` → Hakkımızda
- `/koleksiyon` → Kullanıcı koleksiyonu
- `/profil` → Kullanıcı profili
- `/feed.xml` → RSS feed (yazılar + haberler)
- `/sitemap.xml` → Tüm URL'ler (otomatik)
- `/news-sitemap.xml` → Google News sitemap

---

## 7. Güven Katmanı (Trust Layer)

feedeep'in farkı **güven sistematiğidir.** Her içerik için:

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

## 8. İnsan Yazım Tonu (AI Algısını Kırma Kuralları)

> **Bu bölüm tüm AI ajanlarının içerik üretirken ZORUNLU uygulaması gereken kurallardır.**

### 8.1 Platform Sesi

feedeep bir kişisel blog değil, bir yayın platformu. Yazım tonu buna göre ayarlanır.

```
YAPMA                                    YAP
─────                                    ───
"Geçen hafta şunu fark ettim..."        → "GitHub verilerine göre..."
"Bence şöyle olacak"                    → "Veriler şöyle bir tablo çiziyor"
"Ben", "benim", "bana"                  → Nötr anlatım veya yumuşak "biz"
"Sizin için araştırdık!"               → Direkt bilgiyi ver
```

### 8.2 Noktalama: Minimum İşaret

```
YAPMA                                    YAP
─────                                    ───
Cümle — ve devamı — böyle              → Cümle, ve devamı böyle
"kelime" (her şeyi tırnağa alma)       → Sadece alıntı ve özel terimde tırnak
Vurgu! Her yerde! Ünlem!               → Ünlem neredeyse hiç kullanma
Üç nokta ile bitir...                  → Noktayla bitir.
**Her** **üçüncü** **kelime** bold     → Sadece rakamlar ve şirket adları bold
```

> **MUTLAK KURAL: "—" (em-dash) karakteri HİÇ KULLANILMAZ.** Hem başlıklarda hem de body'de yasak. İki düşünceyi birleştirmek istiyorsan iki ayrı cümle yaz ya da virgül kullan.

**Cümle Yapısı Kuralları:**
- Özne + yüklem yakın durur, araya çok cümle sıkıştırılmaz
- Devrik cümle yasak (yüklem en sona kalır)
- Yüklemsiz cümle yasak: "Saldırganın kurduğu oyunu fark edemeden." → geçersiz
- Noktalı virgül neredeyse hiç; iki ayrı cümle yaz
- Parantez içine teknik terim koyma; cümle yapısına entegre et

### 8.3 Paragraf Asimetrisi

AI her paragrafı aynı uzunlukta yazar. İnsan yazmaz. Bazı paragraflar tek cümle, bazıları beş cümle olmalı.

### 8.4 Yasaklı Kalıplar

- "Hadi başlayalım!" / "Haydi gelin birlikte keşfedelim!"
- "Merak etmeyin, çok kolay!"
- "Bu yazıda X, Y ve Z öğreneceksiniz"
- Sabit başlık kalıpları ("Ne Oldu? / Neden Önemli?")
- Listeye sıralı olmayan maddelerin başına aynı yapıyı koymak
- Emoji kullanmak (site genelinde yasak)

### 8.5 Başlık Stratejisi

> **Temel İlke:** Display title kısa ve temiz olur. SEO zenginliği `description` ve `keywords` alanlarında taşınır.
> "Yasaklı Model: Claude Mythos" > "YANLIŞLIKLA SIZDIRILDI: Anthropic'in Sakladığı Kapalı Model"

**Her 3 başlıktan 1'i kanca olabilir. Hepsi dramatik olursa marka tonu kayar.**

| Haber türü | Format | Örnek |
|---|---|---|
| Olay / Saldırı / Skandal | Soru | Axios Nasıl Hacklendi? |
| Ürün / Duyuru | İsim + özet | ElevenLabs Artık Şirket İçinde Çalışıyor |
| Karar / Anlaşma | Özne + fiil | Meta ve Anthropic Aynı Şirkete Yöneldi |
| Araştırma / Bulgu | Sonuç önce | Açık Kaynak, Kapalı Kaynağı Geçti |

**Başlık Yazım Kuralları:**
- Max 70 karakter (frontmatter kuralı)
- "—" em-dash başlıkta da yasak
- Büyük harf: Sadece ilk kelime + özel isimler (Türkçe standart)
- Clickbait kalıpları yasak: "ŞOK!", "İNANILMAZ!", "KAÇIRMA!"

---

## 9. Kaynak Öncelik Sırası

1. Resmi şirket blogları (OpenAI, Google, Anthropic)
2. LinkedIn lider paylaşımları
3. TechCrunch, The Verge, MIT Tech Review
4. Türkçe kaynaklar (Webrazzi, Webtekno)
5. arXiv / Hugging Face (araştırma)

---

## 10. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| Velite build hatası | Frontmatter YAML formatını kontrol et |
| Slug hata veriyor | Türkçe karakter var mı kontrol et |
| OG image oluşmuyor | `?title=` parametresini kontrol et |
| Sayfa 404 veriyor | `published: true` olduğundan emin ol |
| Description çok uzun | Max 160 karakter, Velite zorunlu kılıyor |
| .next cache sorunu | `Remove-Item -Recurse -Force .next` sonra rebuild |

---

## 11. Commit & Arşiv Sistemi

### Commit Mesajı Formatı
```
<tip>(<kapsam>): <açıklama>

Tipler: feat, fix, content, refactor, docs, style, chore
Kapsam: yazilar, haberler, ui, seo, infra
Dil: Türkçe
```

### Changelog
Her oturum sonunda `CHANGELOG.md` dosyası güncellenir.

---

## 12. HIZLI REFERANS KARTI

| Alan | Limit | Kontrol |
|------|-------|---------|
| title | ≤ 70 karakter | Google 60'ta keser |
| slug | ≤ 60 karakter | Türkçe karakter YOK |
| description | 120-160 karakter | Google 155-160'ta keser |
| keywords | 6 adet | Son sıra: "yapay zeka haberleri" |
| tags | 1-4 adet | TAG_LABELS haritasından seç |
| faq | opsiyonel | question + answer çiftleri |
| sources | min 1 | URL çalışıyor mu? |
| socialSnippet | ≤ 280 karakter | Twitter/X formatı |
| body (haber) | 300-800 kelime | İlk cümle hook |
| body (yazı) | 800-3000 kelime | İlk paragraf keyword |
| published | true | false = sayfada görünmez |

---

## 13. Tag (Etiket) Sistemi

> Tag'ler hub sayfalarını (`/etiketler/[tag]`) besler, cross-type internal linking sağlar ve topical authority oluşturur.

### 13.1 Tag Nasıl Seçilir?

Tag'ler `constants.ts` dosyasındaki `TAG_LABELS` haritasından seçilir. Geçerli tag'ler:

**Şirketler:** `openai`, `anthropic`, `google`, `meta`, `microsoft`, `alibaba`, `nvidia`, `apple`, `cursor`, `mistral`, `bytedance`, `cloudflare`, `figma`, `github`, `perplexity`

**Konular:** `ai-model`, `ai-agent`, `ai-guvenlik`, `yatirim`, `kodlama`, `acik-kaynak`, `kurumsal-ai`, `ses-gorsel-video`, `arastirma`, `turkiye`, `is-hayati`

### 13.2 Tag Kuralları

- Her içeriğe **1-4 tag** ekle. Fazlası spam, azı yetersiz.
- Haritada olmayan tag kullanma. Yeni tag gerekiyorsa önce `TAG_LABELS`'a ekle.
- Tag slug'ları **küçük harf ve tire** ile yazılır: `ai-model`, `acik-kaynak`
- Bir haberde şirket adı geçiyorsa o şirketin tag'ini ekle.
- Konu tag'i şirketten daha önemli: bir haber OpenAI hakkında ama asıl konu güvenlikse, `ai-guvenlik` tag'i `openai`'dan önce gelsin.

### 13.3 Frontmatter Örneği

```yaml
tags:
  - openai
  - ai-model
  - kodlama
```

### 13.4 Tag Eklenmezse Ne Olur?

- `tags: []` (default) ile build hata vermez.
- Ama o içerik hiçbir hub sayfasında görünmez.
- Internal linking zayıflar, topical authority oluşmaz.
- Her yeni içeriğe mutlaka en az 1 tag ekle.

---

## 14. FAQ (Sıkça Sorulan Sorular) Sistemi

> FAQ alanı, içerik sayfasında FAQ JSON-LD structured data üretir. Google'da "People Also Ask" (PAA) kutucuğunda çıkma şansı verir.

### 14.1 Ne Zaman FAQ Eklemeli?

- Yazılarda: hemen hemen her zaman ekle (2-5 soru).
- Haberlerde: opsiyonel. Sadece okuyucunun aklına doğal olarak gelecek sorular varsa.
- Genel kural: yazının/haberin cevapladığı soruları düşün ve FAQ'a taşı.

### 14.2 Frontmatter Örneği

```yaml
faq:
  - question: "ChatGPT ve Claude arasındaki en büyük fark nedir?"
    answer: "ChatGPT genel amaçlı görevlerde daha geniş bir eklenti ekosistemine sahipken, Claude uzun metin anlama ve kod üretiminde daha tutarlı sonuçlar veriyor."
  - question: "Hangi model kodlama için daha iyi?"
    answer: "Claude Opus kod üretiminde daha az hata yaparken, GPT-4o hız avantajı sunuyor. Proje tipine göre seçim değişir."
```

### 14.3 FAQ Kuralları

- Soruları doğal dilde, insanların gerçekten aratacağı şekilde yaz.
- Cevaplar 1-3 cümle, net ve bilgi yoğun.
- Google snippet'ine sığacak uzunlukta: cevap max 300 karakter ideal.
- Yazının body'sinde zaten cevaplanan bir şeyi tekrar etme, tamamlayıcı ol.
- Clickbait soru yazma: "Hangi AI en iyisi?" yerine "ChatGPT ve Claude arasındaki en büyük fark nedir?"

---

## 15. Etiketler Sayfası ve Hub Yapısı

### 15.1 Otomatik Sayfalar

- `/etiketler` — Tüm tag'lerin listesi (sayılarıyla birlikte)
- `/etiketler/[tag]` — Belirli bir tag'e sahip tüm içerikler (haber + yazı karışık, filtrelenebilir)

Bu sayfalar MDX dosyalarındaki `tags` alanından otomatik oluşur. Yeni tag eklendiğinde sayfa otomatik generate edilir.

### 15.2 Internal Linking Akışı

```
Haber/Yazı sayfası
  └─ TagLinks bileşeni → /etiketler/[tag] hub sayfasına link
       └─ Hub sayfası → aynı tag'li diğer içeriklere link
            └─ Topical authority döngüsü tamamlanır
```

### 15.3 Cross-Type Linking

Detay sayfalarında (haberler/[slug] ve yazilar/[slug]):
- Aynı tip ilgili içerikler (RelatedNews / RelatedArticles)
- Farklı tip ilgili içerikler (keyword eşleşmesi ile, max 2)
- TagLinks bileşeni (hub sayfalarına köprü)

Bu üçlü yapı Google'ın internal link graph'ını güçlendirir.
