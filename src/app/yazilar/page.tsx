// ─────────────────────────────────────────────────────────────
// AI Rehber — Yazılar Listesi Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { yazilar } from "#site/content";
import { generateMeta, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { YAZI_CATEGORIES, SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import {
  FilterableContentList,
  type ContentItem,
} from "@/components/shared/filterable-content-list";

export const metadata: Metadata = generateMeta({
  title: "Yapay Zeka Yazıları: Rehberler, Analizler ve İncelemeler [2026]",
  description:
    "Yapay zeka hakkında derinlemesine rehberler, incelemeler, analizler ve karşılaştırmalar. ChatGPT, Claude, Gemini araç incelemeleri ve pratik kullanım kılavuzları.",
  path: "/yazilar",
  keywords: [
    "yapay zeka yazıları",
    "ai rehber",
    "yapay zeka analizleri",
    "ai incelemeleri",
    "chatgpt rehberi",
    "yapay zeka rehberleri",
  ],
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
          collectionPageJsonLd({
            name: "Yapay Zeka Yazıları",
            description: "Yapay zeka hakkında derinlemesine rehberler, incelemeler, analizler ve karşılaştırmalar.",
            url: "/yazilar",
            itemType: "Article",
            items: posts.slice(0, 20).map((p) => ({
              name: p.title,
              url: `${SITE.url}/yazilar/${p.slug}`,
              description: p.description,
            })),
          }),
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
