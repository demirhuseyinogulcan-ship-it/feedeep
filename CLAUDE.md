# feedeep — AI Agent Kuralları
# Bu dosya, projeyle çalışan tüm AI ajanlarının (Copilot, Claude, Cursor, vb.)
# otomatik olarak okuması ve uygulaması gereken kuralları tanımlar.

## Proje Kimliği

- **Proje:** feedeep — Yazılım ve yapay zeka dünyasını Türkçe takip eden bağımsız içerik platformu
- **Stack:** Next.js 16 (App Router, SSG) + React 19 + TypeScript + Tailwind CSS v4 + Velite 0.3 + Supabase
- **Dil:** Türkçe (tr-TR). Kod değişkenleri/fonksiyonları İngilizce, UI metinleri Türkçe.
- **Deploy:** Vercel
- **Domain:** feedeep.com
- **Logo:** Animated gradient text ("feedeep", .logo-gradient CSS class)
- **Favicon:** "fd" harfleri, mor-pembe gradient, siyah zemin

## Tasarım Sistemi

- **Tema:** "The Void speaks in light" — koyu (#050505) arka plan, beyaz/gri tipografi
- **Fontlar:** Montserrat (başlıklar, --font-heading), Inter (body, --font-sans). Sadece bu 2 font.
- **Layout:** Tüm sayfalar `max-w-3xl mx-auto px-4 sm:px-6` — bu genişliği ASLA değiştirme
- **Accent:** Mor-pembe gradient (#7c3aed → #a855f7 → #d946ef → #ec4899)
- **Animasyonlar:** `animate-fade-up` — hafif, minimal. Abartılı animasyon KULLANMA.

## Kod Kuralları

### Genel
- TypeScript strict mode. `any` tipi KULLANMA.
- `"use client"` sadece gerçekten gerekli yerlerde (interaktif bileşenler).
- Server Components tercih et. Client Component minimum tut.
- Import alias: `@/` = `src/`, `#site/content` = `.velite/`
- Dosya başına yorum header'ı ekle: `// feedeep — [Açıklama]`

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
- Emoji ve ikon KULLANMA (kod veya UI'da).

## İçerik Sistemi (Velite)

### Koleksiyonlar (2 aktif)
1. **yazilar** → `/yazilar/[slug]` — İnceleme, analiz, karşılaştırma
2. **haberler** → `/haberler/[slug]` — Güncel AI haberleri

### Yazı Kategorileri
- `inceleme` | `analiz` | `karsilastirma`

### Haber Kategorileri
- `sirketler` | `sektor` | `turkiye` | `arastirma`

### İçerik Kuralları
- Şema tanımı: `velite.config.ts` — tek kaynak (Single Source of Truth)
- Editoryal kılavuz: `CONTENT_SYSTEM.md` — detaylı kurallar burada
- MDX şablonları: `content/_templates/` — yeni içerik oluştururken bunları baz al
- **Haber yazım stili:** Doğal, akıcı, eğitici ama çaktırmadan anlatan gazetecilik dili. Sabit başlık şablonu KULLANMA.
- Frontmatter doğrulama: `npm run validate`
- **Slug'da ASLA Türkçe karakter kullanma** (ş→s, ç→c, ğ→g, ı→i, ö→o, ü→u)
- **title max 70 karakter, description max 160 karakter** — SEO zorunluluğu

### Güven Katmanı
- Her yazıda en az 1 kaynak (`sources`) zorunlu
- Kaynak tier sistemi: Tier 1 (birincil), Tier 2 (güvenilir medya), Tier 3 (ikincil)
- `confidence`: high | medium | speculative — doğru işaretle

## Dosya Yapısı — Değiştirme

```
src/
├── app/           # Next.js App Router sayfaları
├── components/    # Bileşenler (shared, layout, content, feed, seo, signals, auth)
├── hooks/         # Custom React hooks (use-signal, use-comments)
├── lib/           # Yardımcı fonksiyonlar ve sabitler
content/           # Velite MDX içerikler (yazilar, haberler)
├── _templates/    # MDX şablonları (build'e dahil olmaz)
scripts/           # Otomasyon scriptleri
```

## Sabitler

- Site sabitleri: `src/lib/constants.ts` — SITE, NAV_ITEMS, kategoriler
- SEO yardımcıları: `src/lib/seo.ts` — generateMeta(), JSON-LD generators
- E-posta: `hey@feedeep.com`

## Build & Deploy

```bash
npm run validate        # İçerik doğrulama (prebuild'de otomatik çalışır)
npm run build          # next build --webpack (validate + llms.txt + Velite + Next.js)
npm run dev            # Geliştirme sunucusu
npm run test           # Vitest (172 test)
```

## Yapılmaması Gerekenler (Anti-patterns)

- ❌ `console.log` production kodunda bırakma
- ❌ Hardcoded string kullanma — `constants.ts`'e ekle
- ❌ Aynı bileşeni tekrar yazma — `shared/` klasörünü kontrol et
- ❌ `max-w-3xl` layout genişliğini değiştirme
- ❌ pages/ router kullanma — sadece app/ router
- ❌ Client Component'i gereksiz yere kullanma
- ❌ İçerik dosyasında Türkçe karakter slug kullanma
- ❌ Emoji veya ikon kullanma (kodda veya UI'da)
- ❌ "rehber" kelimesini marka metninde kullanma

## Commit Mesajı Formatı

```
<tip>(<kapsam>): <açıklama>

Tipler: feat, fix, content, refactor, docs, style, chore
Kapsam: yazilar, haberler, ui, seo, infra
Dil: Türkçe

Örnekler:
feat(haberler): OpenAI GPT-5.2 haberi eklendi
fix(ui): footer link düzeltmesi
content(yazilar): ChatGPT vs Claude karşılaştırması güncellendi
refactor(infra): marka göçü tamamlandı
```

## Changelog

Her oturumda yapılan işler `CHANGELOG.md` dosyasına kaydedilir.
