# feedeep

A Turkish news and analysis platform about software and AI, built as a scroll-to-read feed. Content is written in MDX, validated at build time and published as static pages. Reader features (votes, comments, saved items, push notifications) run on Supabase. The project is retired and kept as a reference.

**Live demo:** [feedeep.demo.commitius.com](https://feedeep.demo.commitius.com). The demo is a static build: all articles and news work, but sign-in, votes, comments, view counts and notifications are switched off because it runs without Supabase.

![feedeep home page](docs/screenshot.jpg)

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, static generation) |
| UI | React 19, TypeScript (strict), Tailwind CSS 4 |
| Content | MDX with [Velite](https://velite.js.org) and Zod schemas |
| Reader features | Supabase (auth, votes, comments), Upstash rate limiting |
| Email and push | Resend (newsletter), Web Push (VAPID) |
| Search | Fuse.js, client-side |
| SEO | JSON-LD, RSS, Google News sitemap, `llms.txt`, generated OG images |
| Tests | Vitest (173 tests) |
| CI | GitHub Actions: lint, type check, tests, build |

## Features

- Two content types, news (`content/haberler`) and long-form articles (`content/yazilar`), plus guides (`content/rehberler`).
- Frontmatter is checked before every build by `scripts/validate-content.mjs`, so a broken date, category or image path fails the build instead of reaching readers.
- Structured data for articles, news, FAQ and breadcrumbs (`src/lib/seo.ts`).
- Security headers: CSP, HSTS, Permissions-Policy, X-Frame-Options.
- Accessibility basics: skip link, ARIA labels, `prefers-reduced-motion`, semantic HTML.
- PWA with a service worker and offline cache.
- Everything that needs Supabase checks `isSupabaseConfigured()` first, so the site degrades to read-only instead of crashing.

## Project structure

```
src/
  app/                 routes (App Router)
    api/               newsletter, views, stats, push, indexing, OG image
    haberler/          news
    yazilar/           articles
    arama/             search
    koleksiyon/        saved items
    profil/            profile
    feed.xml/          RSS
    news-sitemap.xml/  Google News sitemap
    sitemap.ts, robots.ts
  components/
    content/           MDX rendering
    feed/              news and article cards
    signals/           votes, comments, saves
    seo/               JSON-LD
    layout/, shared/, auth/, interactive/, tools/
  lib/
    seo.ts             structured data builders
    feed.ts            merges and sorts content
    supabase.ts        client with a configured check
    rate-limit.ts      Upstash rate limiting
content/               MDX content and templates
scripts/               validation, llms.txt, indexing, images, demo build
supabase/              schema and migrations
tools/web-scraper-local/  optional local scraping worker (FastAPI + React)
docs/content-system.md editorial guide (Turkish)
```

## Run locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/demirhuseyinogulcan-ship-it/feedeep.git
cd feedeep
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With an empty `.env.local` the site runs read-only. Fill in the Supabase, Resend, Upstash and VAPID values in `.env.local` to enable reader features. The comments in `.env.example` say where each value comes from.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` | full build (runs content validation and `llms.txt` first) |
| `npm run build:demo` | static build into `out/` without API routes or Supabase |
| `npm test` | Vitest |
| `npm run type-check` | TypeScript |
| `npm run new:haber`, `npm run new:yazi` | new content from a template |

## Static demo

`npm run build:demo` sets `FEEDEEP_STATIC_DEMO=1`, moves `src/app/api` aside for the build and restores it afterwards. The result in `out/` can go to any static host:

```bash
npx wrangler pages deploy out --project-name feedeep
```

## License

[MIT](LICENSE)
