// ─────────────────────────────────────────────────────────────
// feedeep — Etiket Hub Sayfası (Topical Authority)
// /etiketler/[tag] — belirli bir etikete sahip tüm içerikler
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateMeta, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { FilterableContentList } from "@/components/shared/filterable-content-list";
import { getAllTags, buildTagFeed } from "@/lib/feed";
import { getTagLabel } from "@/lib/constants";

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const items = buildTagFeed(tag);
  if (items.length === 0) return {};

  const label = getTagLabel(tag);

  return generateMeta({
    title: `${label} Haberleri ve Yazıları`,
    description: `${label} hakkında ${items.length} içerik: güncel haberler, analizler ve incelemeler.`,
    path: `/etiketler/${tag}`,
    canonicalPath: tag === "acik-kaynak" ? "/open-source" : undefined,
    keywords: [label, `${label} haberleri`, `${label} yazıları`, "yapay zeka"],
  });
}

const CATEGORIES = [
  { key: "haber", label: "Haberler" },
  { key: "yazi", label: "Yazılar" },
];

export default async function EtiketHubPage({ params }: Props) {
  const { tag } = await params;
  const items = buildTagFeed(tag);
  if (items.length === 0) notFound();

  const label = getTagLabel(tag);

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: `${label} — feedeep`,
            description: `${label} hakkında ${items.length} içerik`,
            url: `/etiketler/${tag}`,
            itemType: "Article",
            items: items.slice(0, 20).map((item) => ({
              name: item.title,
              url: `${SITE.url}${item.href}`,
              description: item.description,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Etiketler", href: "/etiketler" },
            { name: label, href: `/etiketler/${tag}` },
          ]),
        ]}
      />

      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Etiketler", href: "/etiketler" },
            { label, href: `/etiketler/${tag}` },
          ]}
        />
        <PageHeader
          title={label}
          description={`${items.length} içerik`}
        />
        <FilterableContentList
          items={items}
          categories={CATEGORIES}
          filterKey="type"
          emptyMessage="Bu etikette henüz içerik yok."
        />
      </section>
    </>
  );
}
