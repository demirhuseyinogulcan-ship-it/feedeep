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
    updated: s.isodate().optional(),
    published: s.boolean().default(true),

    // Kategori & Etiketler
    category: s.enum(["rehber", "inceleme", "analiz", "karsilastirma"]),
    keywords: s.array(s.string()).max(6), // max 6: 1 primary + 4 secondary + 1 generic TR SEO

    // SEO
    image: s.string().optional(),
    canonical: s.string().url().optional(),

    // Güven Katmanı
    sources: s.array(sourceSchema).min(1),
    confidence: s.enum(["high", "medium", "speculative"]).default("high"),
    lastFactChecked: s.isodate(),
    corrections: s.array(correctionSchema).default([]),

    // Editoryal
    editorPick: s.boolean().default(false),
    editorNote: s.string().max(200).optional(),
    counterpoint: s.string().optional(),
    actionItems: s.array(s.string()).default([]),

    // Seri Navigasyonu
    series: s.string().optional(),
    seriesOrder: s.number().optional(),

    // Dağıtım
    socialSnippet: s.string().max(280).optional(),

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
    updated: s.isodate().optional(),
    published: s.boolean().default(true),

    // Haber spesifik
    sourceUrl: s.string().url(),
    sourceName: s.string(),
    category: s.enum(["sirketler", "sektor", "turkiye", "arastirma"]),
    keywords: s.array(s.string()).max(6), // max 6: +1 generic TR SEO keyword

    // Güven
    sources: s.array(sourceSchema).min(1),
    confidence: s.enum(["high", "medium", "speculative"]).default("high"),

    // Editoryal
    editorPick: s.boolean().default(false),
    editorNote: s.string().max(200).optional(),

    // Dağıtım
    socialSnippet: s.string().max(280).optional(),

    // MDX body
    body: s.mdx(),
    metadata: s.metadata(),
  }),
});

// ─── Prompt Kütüphanesi ─────────────────────────────────────

const promptlar = defineCollection({
  name: "Prompt",
  pattern: "promptlar/**/*.mdx",
  schema: s.object({
    title: s.string().max(70),
    slug: s.slug("promptlar"),
    description: s.string().max(160),
    date: s.isodate(),
    updated: s.isodate().optional(),
    published: s.boolean().default(true),

    // Prompt spesifik
    prompt: s.string(), // Prompt metni
    category: s.enum(["icerik-uretim", "kod", "analiz", "pazarlama", "egitim", "genel"]),
    difficulty: s.enum(["baslangic", "orta", "ileri"]),
    targetRole: s.string().optional(), // "CMO", "Growth", "Editör"

    // Model skorları
    models: s
      .array(
        s.object({
          name: s.string(),
          score: s.number().min(1).max(10),
          note: s.string().optional(),
        })
      )
      .default([]),

    // Değişkenler
    variables: s
      .array(
        s.object({
          name: s.string(),
          description: s.string(),
          example: s.string().optional(),
        })
      )
      .default([]),

    // Hata senaryoları
    commonMistakes: s.array(s.string()).default([]),

    keywords: s.array(s.string()).max(5),

    // MDX body — detaylı açıklama ve örnek output
    body: s.mdx(),
    metadata: s.metadata(),
  }),
});

// ─── Model/Araç Kartları ────────────────────────────────────

const kartlar = defineCollection({
  name: "Kart",
  pattern: "kartlar/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("kartlar"),
    description: s.string().max(160),
    date: s.isodate(),
    updated: s.isodate().optional(),
    published: s.boolean().default(true),

    // Model/Araç bilgileri
    type: s.enum(["model", "arac"]),
    company: s.string(),
    logo: s.string().optional(),
    website: s.string().url().optional(),
    status: s.enum(["active", "beta", "deprecated"]).default("active"),

    // Fiyatlandırma
    pricing: s
      .object({
        free: s.boolean().default(false),
        input: s.string().optional(),
        output: s.string().optional(),
        note: s.string().optional(),
      })
      .optional(),

    // Teknik
    contextWindow: s.number().optional(),
    releaseDate: s.isodate().optional(),

    // Benchmark
    benchmarks: s
      .array(
        s.object({
          name: s.string(),
          score: s.number(),
          maxScore: s.number().optional(),
        })
      )
      .default([]),

    // İlgili içerikler
    relatedYazilar: s.array(s.string()).default([]),

    // MDX body — detaylı inceleme
    body: s.mdx(),
    metadata: s.metadata(),
  }),
});

// ─── Haftalık Brifing ───────────────────────────────────────

const haftalik = defineCollection({
  name: "Haftalik",
  pattern: "haftalik/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("haftalik"),
    description: s.string().max(160),
    weekNumber: s.number(),
    year: s.number(),
    date: s.isodate(),
    published: s.boolean().default(true),

    // Editör seçimi — haftanın en önemli 3 gelişmesi
    highlights: s
      .array(
        s.object({
          title: s.string(),
          summary: s.string(),
          url: s.string().url().optional(),
        })
      )
      .max(3),

    // Bu hafta denenecek aksiyon
    weeklyAction: s.string(),

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
  collections: { yazilar, haberler, promptlar, haftalik },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, { theme: "github-dark-default", keepBackground: true }],
    ],
  },
});
