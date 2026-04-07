// ─────────────────────────────────────────────────────────────
// feedeep — Haberler Listesi Sayfası (Velite)
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
import { FilterableContentList } from "@/components/shared/filterable-content-list";
import { buildHaberFeed } from "@/lib/feed";

const publishedNews = haberler
  .filter((h) => h.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const metadata: Metadata = generateMeta({
  title: "Yazılım ve AI Haberleri: Güncel Gelişmeler [2026]",
  description: `Yapay zeka, yazılım ve web geliştirme dünyasından ${publishedNews.length}+ güncel haber. Şirket duyuruları, sektör analizleri ve teknoloji trendleri — her gün güncelleniyor.`,
  path: "/haberler",
  keywords: [
    "yapay zeka haberleri",
    "yazılım haberleri",
    "ai haberleri",
    "kodlama haberleri",
    "web geliştirme haberleri",
    "teknoloji gelişmeleri 2026",
  ],
});

export default function HaberlerPage() {
  const news = publishedNews;
  const items = buildHaberFeed();

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
      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
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
