// ─────────────────────────────────────────────────────────────
// AI Rehber — Yazılar Listesi Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { yazilar } from "#site/content";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { YAZI_CATEGORIES } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import {
  FilterableContentList,
  type ContentItem,
} from "@/components/shared/filterable-content-list";

export const metadata: Metadata = generateMeta({
  title: "Yazılar",
  description:
    "Yapay zeka hakkında derinlemesine rehberler, incelemeler, analizler ve karşılaştırmalar.",
  path: "/yazilar",
});

export default function YazilarPage() {
  const posts = yazilar
    .filter((y) => y.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items: ContentItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    category: p.category,
    categoryLabel: YAZI_CATEGORIES[p.category] ?? p.category,
    href: `/yazilar/${p.slug}`,
  }));

  const categories = Object.entries(YAZI_CATEGORIES).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Yazılar", href: "/yazilar" },
          ]),
        ]}
      />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Yazılar", href: "/yazilar" },
          ]}
        />
        <PageHeader
        title="Yazılar"
        description="Derinlemesine rehberler, incelemeler, analizler ve karşılaştırmalar."
      />
      <FilterableContentList
        items={items}
        categories={categories}
        emptyMessage="Bu kategoride henüz yazı yok."
      />
      </section>
    </>
  );
}
