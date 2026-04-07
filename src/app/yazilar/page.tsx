// ─────────────────────────────────────────────────────────────
// feedeep — Yazılar Listesi Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { yazilar } from "#site/content";
import { generateMeta, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { YAZI_CATEGORIES, SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { FilterableContentList } from "@/components/shared/filterable-content-list";
import { buildYaziFeed } from "@/lib/feed";

export const metadata: Metadata = generateMeta({
  title: "Yazılım ve AI Yazıları: Analizler ve İncelemeler [2026]",
  description:
    "Yapay zeka ve yazılım dünyasından derinlemesine analizler, araç incelemeleri ve karşılaştırmalar.",
  path: "/yazilar",
  keywords: [
    "yapay zeka yazıları",
    "yazılım analizleri",
    "ai araç incelemeleri",
    "feedeep yazılar",
    "teknoloji incelemeleri",
    "yazılım karşılaştırma",
  ],
});

export default function YazilarPage() {
  const posts = yazilar
    .filter((y) => y.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = buildYaziFeed();

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
            description: "Yapay zeka ve yazılım hakkında derinlemesine analizler, incelemeler ve karşılaştırmalar.",
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
      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Yazılar", href: "/yazilar" },
          ]}
        />
        <PageHeader
        title="Yazılar"
        description="Derinlemesine analizler, incelemeler ve karşılaştırmalar."
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
