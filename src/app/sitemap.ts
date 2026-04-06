// ─────────────────────────────────────────────────────────────
// AI Rehber — sitemap.ts (Dynamic XML Sitemap)
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { yazilar, haberler, rehberler } from "#site/content";

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
      url: `${SITE.url}/programlama`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
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
    {
      url: `${SITE.url}/yazar/can-demir`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
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

  // Rehber overview sayfaları (pillar pages)
  const guides = new Set(rehberler.filter((r) => r.published).map((r) => r.guide));
  const rehberOverviewPages: MetadataRoute.Sitemap = Array.from(guides).map((g) => ({
    url: `${SITE.url}/programlama/${g}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Rehber bölüm sayfaları
  const rehberPages: MetadataRoute.Sitemap = rehberler
    .filter((r) => r.published)
    .map((r) => ({
      url: `${SITE.url}/programlama/${r.guide}/${r.slug}`,
      lastModified: r.updated ?? r.date,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    ...staticPages,
    ...yazilarPages,
    ...haberlerPages,
    ...rehberOverviewPages,
    ...rehberPages,
  ];
}
