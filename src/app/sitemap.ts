// ─────────────────────────────────────────────────────────────
// AI Rehber — sitemap.ts (Dynamic XML Sitemap)
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { yazilar, haberler, promptlar, kartlar, haftalik } from "#site/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE.url}/yazilar`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/haberler`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/prompt-kutuphanesi`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/modeller`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/zaman-cizelgesi`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE.url}/haftalik`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE.url}/hakkimizda`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE.url}/arama`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dinamik içerikler (Velite)
  const yazilarPages: MetadataRoute.Sitemap = yazilar
    .filter((y) => y.published)
    .map((y) => ({
      url: `${SITE.url}/yazilar/${y.slug}`,
      lastModified: y.updated ?? y.date,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const haberlerPages: MetadataRoute.Sitemap = haberler
    .filter((h) => h.published)
    .map((h) => ({
      url: `${SITE.url}/haberler/${h.slug}`,
      lastModified: h.updated ?? h.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const promptlarPages: MetadataRoute.Sitemap = promptlar
    .filter((p) => p.published)
    .map((p) => ({
      url: `${SITE.url}/prompt-kutuphanesi/${p.slug}`,
      lastModified: p.updated ?? p.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const kartlarPages: MetadataRoute.Sitemap = kartlar
    .filter((k) => k.published)
    .map((k) => ({
      url: `${SITE.url}/modeller/${k.slug}`,
      lastModified: k.updated ?? k.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const haftalikPages: MetadataRoute.Sitemap = haftalik
    .filter((h) => h.published)
    .map((h) => ({
      url: `${SITE.url}/haftalik/${h.slug}`,
      lastModified: h.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...yazilarPages,
    ...haberlerPages,
    ...promptlarPages,
    ...kartlarPages,
    ...haftalikPages,
  ];
}
