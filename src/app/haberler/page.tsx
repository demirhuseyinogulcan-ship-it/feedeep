// ─────────────────────────────────────────────────────────────
// AI Rehber — Haberler Listesi Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { haberler } from "#site/content";
import { generateMeta } from "@/lib/seo";
import { HABER_CATEGORIES } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import {
  FilterableContentList,
  type ContentItem,
} from "@/components/shared/filterable-content-list";

export const metadata: Metadata = generateMeta({
  title: "Haberler",
  description:
    "Yapay zeka dünyasından güncel haberler, şirket duyuruları ve sektör gelişmeleri.",
  path: "/haberler",
});

export default function HaberlerPage() {
  const news = haberler
    .filter((h) => h.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items: ContentItem[] = news.map((n) => ({
    slug: n.slug,
    title: n.title,
    description: n.description,
    date: n.date,
    category: n.category,
    categoryLabel: HABER_CATEGORIES[n.category] ?? n.category,
    meta: n.sourceName,
    href: `/haberler/${n.slug}`,
  }));

  const categories = Object.entries(HABER_CATEGORIES).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <PageHeader
        title="Haberler"
        description="Yapay zeka dünyasından güncel gelişmeler."
      />
      <FilterableContentList
        items={items}
        categories={categories}
        emptyMessage="Bu kategoride henüz haber yok."
      />
    </section>
  );
}
