# AI Rehber

**Turkiye'nin yapay zeka odakli bagimsiz icerik platformu.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Velite](https://img.shields.io/badge/CMS-Velite_0.3-orange)](https://velite.js.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> [airehber.com](https://airehber.com) — Guncel AI haberleri, derinlemesine analizler, prompt sablonlari ve programlama rehberleri.

---

## Mimari Genel Bakis

```
src/
├── app/                 # Next.js App Router (SSG)
│   ├── api/             # API Routes (newsletter, indexing, OG image)
│   ├── haberler/        # AI haber arsivi
│   ├── yazilar/         # Analiz & rehber yazilari
│   ├── prompt-kutuphanesi/ # Prompt sablonlari
│   ├── haftalik/        # Haftalik AI brifingleri
│   ├── programlama/     # Interaktif programlama rehberleri
│   ├── feed.xml/        # RSS Feed (dinamik)
│   ├── news-sitemap.xml/# Google News Sitemap
│   └── sitemap.ts       # Dinamik sitemap
├── components/
│   ├── shared/          # Yeniden kullanilabilir UI bileşenleri
│   ├── layout/          # Header, Footer, Navigation
│   ├── content/         # MDX rendering bileşenleri
│   ├── seo/             # JSON-LD, meta bileşenleri
│   └── interactive/     # Client-side interaktif bileşenler
├── lib/
│   ├── seo.ts           # 15+ JSON-LD generator (WebSite, Article, FAQ, HowTo, Course...)
│   ├── utils.ts         # Utility fonksiyonlari (slugify, formatDate, timeAgo...)
│   └── constants.ts     # Site sabitleri & kategori mapleri
content/                 # Velite MDX icerikler
├── haberler/            # 68+ haber makalesi
├── yazilar/             # 10+ analiz yazisi
├── promptlar/           # 8+ prompt sablonu
├── haftalik/            # 4+ haftalik brifing
└── _templates/          # Icerik sablonlari
scripts/                 # Otomasyon (validate, indexing, llms.txt)
```

## Teknoloji Yigini

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router, Static Site Generation) |
| UI | React 19 + TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (CSS-first config, design tokens) |
| CMS | Velite 0.3 (MDX + Zod schema validation) |
| SEO | 15+ JSON-LD semalari, OG image API, RSS, News Sitemap |
| Analytics | Vercel Analytics + Google Analytics 4 + Web Vitals |
| PWA | Service Worker, manifest.json, offline cache |
| Email | Resend API (newsletter) |
| Search | Fuse.js (client-side fuzzy search) |
| Fonts | Montserrat + Inter + JetBrains Mono (next/font) |
| CI/CD | GitHub Actions (lint, type-check, test, build) |
| Deploy | Vercel |

## Ozellikler

- **Kapsamli SEO:** 15+ JSON-LD sema tipi, dinamik OG image, hreflang, news-sitemap, RSS
- **llms.txt:** LLM-dostu site dokumantasyonu (ileriye donuk)
- **Icerik dogrulama:** Pre-build frontmatter validation (70+ kural)
- **Guvenlik:** HSTS, CSP, Permissions-Policy, X-Frame-Options, nosniff
- **Erisebilirlik:** Skip-to-content, aria-labels, prefers-reduced-motion, semantic HTML
- **Web Vitals:** CLS, LCP, INP, TTFB izleme → GA4 event
- **Tasarim sistemi:** "The Void" — monokrom dark tema, CSS design tokens

## Baslangic

### Gereksinimler

- Node.js >= 18
- npm >= 9

### Kurulum

```bash
git clone https://github.com/demirhuseyinogulcan-ship-it/airehber.git
cd airehber
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
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript tip kontrolu
npm run test         # Vitest unit testleri
npm run validate     # Icerik frontmatter dogrulama
```

### Yeni Icerik Olusturma

```bash
npm run new:haber    # Yeni haber makalesi
npm run new:yazi     # Yeni analiz yazisi
npm run new:prompt   # Yeni prompt sablonu
npm run new:haftalik # Yeni haftalik brifing
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
| `CONTENT_SYSTEM.md` | Editoryal kilavuz (1000+ satir) — tier sistemi, yazim kurallari |
| `CHANGELOG.md` | Oturum bazli degisiklik kaydi |
| `public/llms.txt` | LLM-dostu site icerik haritasi |

## Lisans

MIT
