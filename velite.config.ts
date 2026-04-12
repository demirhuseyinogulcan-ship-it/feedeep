// ─────────────────────────────────────────────────────────────
// AI Rehber — Velite Content Schema Configuration
// Tüm içerik tipleri burada tanımlanır (Single Source of Truth)
// ─────────────────────────────────────────────────────────────

import { defineConfig, defineCollection, s } from "velite";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

// ─── Ortak Alanlar ──────────────────────────────────────────

const sourceSchema = s.object({
  url: s.string().url(),
  label: s.string(),
  tier: s.number().min(1).max(3), // 1=birincil, 2=güvenilir medya, 3=ikincil
});

const correctionSchema = s.object({
  date: s.string(),
  note: s.string(),
});

// ─── Yazılar (Rehber, İnceleme, Analiz, Karşılaştırma) ─────

const yazilar = defineCollection({
  name: "Yazi",
  pattern: "yazilar/**/*.mdx",
  schema: s.object({
    title: s.string().max(70),
    slug: s.slug("yazilar"),
    description: s.string().max(160),
    date: s.isodate(),
    publishedAt: s.isodate().optional(),
    updated: s.isodate().optional(),
    published: s.boolean().default(true),

    // Kategori & Etiketler
    category: s.enum(["inceleme", "analiz", "karsilastirma"]),
    keywords: s.array(s.string()).max(6), // max 6: 1 primary + 4 secondary + 1 generic TR SEO
    tags: s.array(s.string()).default([]), // Hub sayfalarinda kullanilacak normalize etiketler

    // Görsel
    image: s.string().optional(),
    imageAlt: s.string().optional(),
    imageCredit: s.string().optional(),
    blurDataURL: s.string().optional(),

    // SEO
    canonical: s.string().url().optional(),

    // Güven Katmanı
    sources: s.array(sourceSchema).min(1),
    confidence: s.enum(["high", "medium", "speculative"]).default("high"),
    lastFactChecked: s.isodate(),
    corrections: s.array(correctionSchema).default([]),

    // Editoryal
    editorPick: s.boolean().default(false),
    editorNote: s.string().max(200).optional(),
    actionItems: s.array(s.string()).default([]),

    // Seri Navigasyonu
    series: s.string().optional(),
    seriesOrder: s.number().optional(),

    // Dağıtım
    socialSnippet: s.string().max(280).optional(),

    // AEO — Soru-Cevap (FAQ JSON-LD + sayfa icinde gosterim)
    faq: s.array(s.object({
      question: s.string(),
      answer: s.string(),
    })).default([]),

    // MDX body
    body: s.mdx(),
    toc: s.toc(),
    metadata: s.metadata(),
  }),
});

// ─── Haberler ───────────────────────────────────────────────

const haberler = defineCollection({
  name: "Haber",
  pattern: "haberler/**/*.mdx",
  schema: s.object({
    title: s.string().max(70),
    slug: s.slug("haberler"),
    description: s.string().max(160),
    date: s.isodate(),
    publishedAt: s.isodate().optional(),
    updated: s.isodate().optional(),
    published: s.boolean().default(true),

    // Görsel
    image: s.string().optional(),
    imageAlt: s.string().optional(),
    imageCredit: s.string().optional(),
    blurDataURL: s.string().optional(),

    // Haber spesifik
    sourceUrl: s.string().url(),
    sourceName: s.string(),
    category: s.enum(["sirketler", "sektor", "turkiye", "arastirma"]),
    keywords: s.array(s.string()).max(6), // max 6: +1 generic TR SEO keyword
    tags: s.array(s.string()).default([]), // Hub sayfalarinda kullanilacak normalize etiketler

    // Güven
    sources: s.array(sourceSchema).min(1),
    confidence: s.enum(["high", "medium", "speculative"]).default("high"),

    // Editoryal
    editorPick: s.boolean().default(false),
    editorNote: s.string().max(200).optional(),

    // Dağıtım
    socialSnippet: s.string().max(280).optional(),

    // AEO — Soru-Cevap (FAQ JSON-LD + sayfa icinde gosterim)
    faq: s.array(s.object({
      question: s.string(),
      answer: s.string(),
    })).default([]),

    // MDX body
    body: s.mdx(),
    metadata: s.metadata(),
  }),
});

// ─── Velite Config Export ────────────────────────────────────

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { yazilar, haberler },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, { theme: "github-dark-default", keepBackground: true }],
    ],
  },
});
