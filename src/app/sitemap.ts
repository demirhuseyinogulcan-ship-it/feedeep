// ─────────────────────────────────────────────────────────────
// feedeep — sitemap.ts (Dynamic XML Sitemap)
// İçerik tipine ve yaşına göre dinamik crawl hiyerarşisi:
//   Haberler  → fresh: daily,  aging: weekly,  old: monthly
//   Yazılar   → fresh: weekly, aging: monthly
//   Statik    → tip bazlı sabit frekans
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { yazilar, haberler } from "#site/content";

// ─── Crawl Frequency Hesaplama ──────────────────────────────

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

/** İçeriğin kaç gün önce güncellendiğini hesapla */
function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Haber içerikleri: Google'a tarama sıklığı sinyali.
 * < 7 gün  → daily   (taze haber, sık tara)
 * < 30 gün → weekly  (hâlâ güncel, haftalık yeter)
 * > 30 gün → monthly (arşiv, ayda bir kontrol)
 */
function haberChangeFreq(lastModified: string): ChangeFreq {
  const age = daysSince(lastModified);
  if (age < 7) return "daily";
  if (age < 30) return "weekly";
  return "monthly";
}

/**
 * Haber priority: taze haberler daha önemli.
 * < 7 gün  → 0.9 (ana sayfa seviyesi)
 * < 30 gün → 0.7 (standart)
 * > 30 gün → 0.5 (arşiv)
 */
function haberPriority(lastModified: string): number {
  const age = daysSince(lastModified);
  if (age < 7) return 0.9;
  if (age < 30) return 0.7;
  return 0.5;
}

/**
 * Yazı içerikleri: daha uzun ömürlü, daha yavaş crawl.
 * < 30 gün → weekly  (yeni analiz, düzenleme olabilir)
 * > 30 gün → monthly (stabil içerik)
 */
function yaziChangeFreq(lastModified: string): ChangeFreq {
  const age = daysSince(lastModified);
  if (age < 30) return "weekly";
  return "monthly";
}

// ─── Sitemap Generator ─────────────────────────────────────

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Statik sayfalar — tip bazlı sabit frekans
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
      url: `${SITE.url}/open-source`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
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

  // Yazılar (analiz/inceleme) — yaşa göre dinamik frekans
  const yazilarPages: MetadataRoute.Sitemap = yazilar
    .filter((y) => y.published)
    .map((y) => {
      const modified = y.updated ?? y.date;
      return {
        url: `${SITE.url}/yazilar/${y.slug}`,
        lastModified: modified,
        changeFrequency: yaziChangeFreq(modified),
        priority: 0.8,
      };
    });

  // Haberler — yaşa göre dinamik frekans + priority
  const haberlerPages: MetadataRoute.Sitemap = haberler
    .filter((h) => h.published)
    .map((h) => {
      const modified = h.updated ?? h.date;
      return {
        url: `${SITE.url}/haberler/${h.slug}`,
        lastModified: modified,
        changeFrequency: haberChangeFreq(modified),
        priority: haberPriority(modified),
      };
    });

  return [
    ...staticPages,
    ...yazilarPages,
    ...haberlerPages,
  ];
}
