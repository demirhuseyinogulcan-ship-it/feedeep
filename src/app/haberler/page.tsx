// ─────────────────────────────────────────────────────────────
// AI Rehber — Haberler Listesi Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { haberler } from "#site/content";
import {
  generateMeta,
  collectionPageJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { HABER_CATEGORIES, SITE } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import {
  FilterableContentList,
  type ContentItem,
} from "@/components/shared/filterable-content-list";

const publishedNews = haberler
  .filter((h) => h.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const metadata: Metadata = generateMeta({
  title: "Yapay Zeka Haberleri: Güncel AI Gelişmeleri [2026]",
  description: `OpenAI, Google, Anthropic ve Türkiye'den ${publishedNews.length}+ yapay zeka haberi. Sektör analizleri, şirket duyuruları ve AI trendleri — her gün güncelleniyor.`,
  path: "/haberler",
  keywords: [
    "yapay zeka haberleri",
    "ai haberleri",
    "openai haberleri",
    "google ai haberleri",
    "türkiye yapay zeka",
    "ai gelişmeleri 2026",
  ],
});

export default function HaberlerPage() {
  const news = publishedNews;

  const items: ContentItem[] = news.map((n) => ({
    slug: n.slug,
    title: n.title,
    description: n.description,
    date: n.date,
    category: n.category,
    categoryLabel: HABER_CATEGORIES[n.category] ?? n.category,
    meta: n.sourceName,
    href: `/haberler/${n.slug}`,
    image: n.image,
    imageAlt: n.imageAlt,
  }));

  const categories = Object.entries(HABER_CATEGORIES).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "Yapay Zeka Haberleri",
            description: `OpenAI, Google, Anthropic ve Türkiye'den ${news.length}+ yapay zeka haberi`,
            url: "/haberler",
            itemType: "NewsArticle",
            items: news.slice(0, 20).map((n) => ({
              name: n.title,
              url: `${SITE.url}/haberler/${n.slug}`,
              description: n.description,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Haberler", href: "/haberler" },
          ]),
        ]}
      />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Haberler", href: "/haberler" },
          ]}
        />
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
    </>
  );
}
