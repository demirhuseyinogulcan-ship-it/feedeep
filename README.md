# feedeep

**Yazilim ve yapay zeka dunyasini Turkce takip eden bagimsiz icerik platformu.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Velite](https://img.shields.io/badge/CMS-Velite_0.3-orange)](https://velite.js.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> [feedeep.com](https://feedeep.com) — Guncel AI haberleri, derinlemesine analizler ve arac incelemeleri.

---

## Mimari Genel Bakis

```
src/
├── app/                 # Next.js App Router (SSG)
│   ├── api/             # API Routes (newsletter, indexing, OG image)
│   ├── haberler/        # AI haber arsivi
│   ├── yazilar/         # Analiz & inceleme yazilari
│   ├── arama/           # Site ici arama
│   ├── hakkimizda/      # Hakkimizda sayfasi
│   ├── koleksiyon/      # Kullanici koleksiyonu
│   ├── profil/          # Kullanici profili
│   ├── feed.xml/        # RSS Feed (dinamik)
│   ├── news-sitemap.xml/# Google News Sitemap
│   └── sitemap.ts       # Dinamik sitemap
├── components/
│   ├── shared/          # Yeniden kullanilabilir UI bilesenleri
│   ├── layout/          # Header, Footer, Navigation
│   ├── content/         # MDX rendering bilesenleri
│   ├── feed/            # Haber ve yazi kartlari
│   ├── seo/             # JSON-LD, meta bilesenleri
│   ├── signals/         # Oy, yorum, sahiplenme bilesenleri
│   └── auth/            # Kimlik dogrulama bilesenleri
├── lib/
│   ├── seo.ts           # JSON-LD generators (WebSite, Article, NewsArticle, FAQ...)
│   ├── utils.ts         # Utility fonksiyonlari (slugify, formatDate, timeAgo...)
│   ├── constants.ts     # Site sabitleri & kategori mapleri
│   ├── homepage.ts      # Ana sayfa veri katmani
│   └── feed.ts          # Icerik birlestirme & siralama
content/                 # Velite MDX icerikler
├── haberler/            # 91+ haber makalesi
├── yazilar/             # 11+ analiz yazisi
└── _templates/          # Icerik sablonlari
scripts/                 # Otomasyon (validate, indexing, llms.txt, favicon)
```

## Teknoloji Yigini

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router, Static Site Generation) |
| UI | React 19 + TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (CSS-first config, design tokens) |
| CMS | Velite 0.3 (MDX + Zod schema validation) |
| Backend | Supabase (auth, signals, comments) |
| SEO | JSON-LD semalari, OG image API, RSS, News Sitemap |
| Analytics | Vercel Analytics + Google Analytics 4 + Web Vitals |
| PWA | Service Worker, manifest.json, offline cache |
| Email | Resend API (newsletter) |
| Search | Fuse.js (client-side fuzzy search) |
| Fonts | Montserrat (headings) + Inter (body) |
| Testing | Vitest (172 test) |
| CI/CD | GitHub Actions (lint, type-check, test, build) |
| Deploy | Vercel |

## Ozellikler

- **Kapsamli SEO:** JSON-LD sema tipleri, dinamik OG image, hreflang, news-sitemap, RSS
- **llms.txt:** LLM-dostu site dokumantasyonu (ChatGPT, Claude, Gemini uyumlu)
- **Icerik dogrulama:** Pre-build frontmatter validation (70+ kural)
- **Sinyal sistemi:** Oy verme, sahiplenme, yorum — Supabase tabanli
- **Guvenlik:** HSTS, CSP, Permissions-Policy, X-Frame-Options, nosniff
- **Erisebilirlik:** Skip-to-content, aria-labels, prefers-reduced-motion, semantic HTML
- **Web Vitals:** CLS, LCP, INP, TTFB izleme → GA4 event
- **Tasarim sistemi:** "The Void" — koyu tema, mor-pembe gradient accent, CSS design tokens

## Baslangic

### Gereksinimler

- Node.js >= 18
- npm >= 9

### Kurulum

```bash
git clone https://github.com/demirhuseyinogulcan-ship-it/airehber.git
cd feedeep
npm install
```

### Ortam Degiskenleri

```bash
cp .env.example .env.local
```

Gerekli degiskenler icin `.env.example` dosyasina bakin.

### Gelistirme

```bash
npm run dev          # Gelistirme sunucusu (localhost:3000)
npm run build        # Production build (validate + llms.txt + next build)
npm run lint         # ESLint
npm run type-check   # TypeScript tip kontrolu
npm run test         # Vitest unit testleri (172 test)
npm run validate     # Icerik frontmatter dogrulama
```

### Yeni Icerik Olusturma

```bash
npm run new:haber    # Yeni haber makalesi
npm run new:yazi     # Yeni analiz yazisi
```

## Post-Deploy Index Pipeline

Deploy sonrasi otomatik Google Search Console indeksleme akisi:

1. Vercel webhook → `POST /api/indexing/trigger`
2. Endpoint → GitHub `repository_dispatch` → `post-deploy-indexing` workflow
3. Workflow → `scripts/submit-indexing.mjs` → Search Console sitemap submit

```bash
npm run submit-indexing  # Manuel test
```

## Proje Dokumantasyonu

| Dosya | Aciklama |
|-------|----------|
| `CLAUDE.md` | AI agent kurallari ve kod konvansiyonlari |
| `CONTENT_SYSTEM.md` | Editoryal kilavuz — tier sistemi, yazim kurallari |
| `CHANGELOG.md` | Oturum bazli degisiklik kaydi |
| `public/llms.txt` | LLM-dostu site icerik haritasi |

## Lisans

MIT
