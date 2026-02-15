# AI Rehber — AI Agent Kuralları
# Bu dosya, projeyle çalışan tüm AI ajanlarının (Copilot, Claude, Cursor, vb.)
# otomatik olarak okuması ve uygulaması gereken kuralları tanımlar.

## Proje Kimliği

- **Proje:** AI Rehber — Türkiye'nin yapay zeka odaklı bağımsız içerik platformu
- **Stack:** Next.js 16 (App Router, SSG) + React 19 + TypeScript + Tailwind CSS v4 + Velite 0.3
- **Dil:** Türkçe (tr-TR). Kod değişkenleri/fonksiyonları İngilizce, UI metinleri Türkçe.
- **Deploy:** Vercel (planlanan)
- **Domain:** airehber.com

## Tasarım Sistemi

- **Tema:** "The Void speaks in light" — siyah (#000) arka plan, beyaz/gri tipografi
- **Fontlar:** Montserrat (başlıklar, font-heading), Inter (body, font-sans), JetBrains Mono (kod, font-mono)
- **Layout:** Tüm sayfalar `max-w-3xl mx-auto px-4 sm:px-6` — bu genişliği ASLA değiştirme
- **Renk paleti:** Monokrom — siyah, beyaz, griler. Accent renk YOK.
- **Animasyonlar:** `animate-fade-up` — hafif, minimal. Abartılı animasyon KULLANMA.

## Kod Kuralları

### Genel
- TypeScript strict mode. `any` tipi KULLANMA.
- `"use client"` sadece gerçekten gerekli yerlerde (interaktif bileşenler).
- Server Components tercih et. Client Component minimum tut.
- Import alias: `@/` = `src/`, `#site/content` = `.velite/`
- Dosya başına yorum header'ı ekle: `// AI Rehber — [Açıklama]`

### Bileşen Kuralları
- Shared bileşenler: `src/components/shared/`
- Layout bileşenler: `src/components/layout/`
- İçerik bileşenleri: `src/components/content/`
- SEO bileşenleri: `src/components/seo/`
- Her bileşen tek dosyada. Barrel export KULLANMA.

### Stil Kuralları
- Tailwind CSS v4 utility-first. Inline style KULLANMA.
- `clsx()` + `tailwind-merge` ile conditional class.
- CSS-in-JS KULLANMA. Styled-components KULLANMA.
- Custom CSS sadece `globals.css` @theme bloğunda.

## İçerik Sistemi (Velite)

### Koleksiyonlar
1. **yazilar** → `/yazilar/[slug]` — Rehber, inceleme, analiz, karşılaştırma
2. **haberler** → `/haberler/[slug]` — Güncel AI haberleri
3. **promptlar** → `/prompt-kutuphanesi/[slug]` — Test edilmiş prompt şablonları
4. **kartlar** → `/modeller/[slug]` — AI model/araç bilgi kartları
5. **haftalik** → `/haftalik/[slug]` — Haftalık AI brifingleri

### İçerik Kuralları
- Şema tanımı: `velite.config.ts` — tek kaynak (Single Source of Truth)
- Editoryal kılavuz: `CONTENT_SYSTEM.md` — detaylı kurallar burada
- MDX şablonları: `content/_templates/` — yeni içerik oluştururken bunları baz al
- Frontmatter doğrulama: `npm run validate`
- **Slug'da ASLA Türkçe karakter kullanma** (ş→s, ç→c, ğ→g, ı→i, ö→o, ü→u)
- **title max 70 karakter, description max 160 karakter** — SEO zorunluluğu

### Güven Katmanı
- Her yazıda en az 1 kaynak (`sources`) zorunlu
- Kaynak tier sistemi: Tier 1 (birincil), Tier 2 (güvenilir medya), Tier 3 (ikincil)
- `confidence`: high | medium | speculative — doğru işaretle
- Doğrulanamayan bilgi → `speculative` + açık belirtme

## Dosya Yapısı — Değiştirme

```
src/
├── app/           # Next.js App Router sayfaları
├── components/    # Bileşenler (shared, layout, content, seo)
├── lib/           # Yardımcı fonksiyonlar ve sabitler
content/           # Velite MDX içerikler
├── _templates/    # MDX şablonları (build'e dahil olmaz)
scripts/           # Otomasyon scriptleri
```

## Sabitler

- Site sabitleri: `src/lib/constants.ts` — SITE, NAV_ITEMS, kategoriler
- SEO yardımcıları: `src/lib/seo.ts` — generateMeta()
- Zaman çizelgesi: `src/lib/timeline-data.ts` — EDITORIAL_TIMELINE
- E-posta: `info@airehber.com` (resmi), `can@airehber.com` (kişisel gönderim)

## Build & Deploy

```bash
npm run validate        # İçerik doğrulama (prebuild'de otomatik çalışır)
npm run build          # next build --webpack (Velite + Next.js birlikte)
npm run dev            # Geliştirme sunucusu
```

## Yapılmaması Gerekenler (Anti-patterns)

- ❌ `console.log` production kodunda bırakma
- ❌ Hardcoded string kullanma — `constants.ts`'e ekle
- ❌ Aynı bileşeni tekrar yazma — `shared/` klasörünü kontrol et
- ❌ `max-w-3xl` layout genişliğini değiştirme
- ❌ Monokrom tema dışında renk ekleme
- ❌ pages/ router kullanma — sadece app/ router
- ❌ Client Component'i gereksiz yere kullanma
- ❌ İçerik dosyasında Türkçe karakter slug kullanma

## Commit Mesajı Formatı

```
<tip>(<kapsam>): <açıklama>

Tipler: feat, fix, content, refactor, docs, style, chore
Kapsam: yazilar, haberler, promptlar, kartlar, haftalik, ui, seo, infra
Dil: Türkçe

Örnekler:
feat(haberler): OpenAI GPT-5.2 haberi eklendi
fix(ui): footer link düzeltmesi
content(yazilar): ChatGPT vs Claude karşılaştırması güncellendi
refactor(infra): timeline verisi ayrı dosyaya taşındı
docs(system): CONTENT_SYSTEM.md oluşturuldu
```

## Changelog

Her oturumda yapılan işler `CHANGELOG.md` dosyasına kaydedilir.
Yeni bir oturuma başlarken changelog'u oku ve devam et.
