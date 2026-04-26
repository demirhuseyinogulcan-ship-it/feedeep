import type { Metadata } from "next";
import { buildTagFeed } from "@/lib/feed";
import { generateMeta, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { FilterableContentList } from "@/components/shared/filterable-content-list";

const items = buildTagFeed("acik-kaynak");

const CATEGORIES = [
  { key: "yazi", label: "Yazılar" },
  { key: "haber", label: "Haberler" },
];

export const metadata: Metadata = generateMeta({
  title: "Open Source: Açık Kaynak Yazılımlar ve Ücretsiz Araçlar",
  description:
    "Açık kaynak yazılımlar, ücretsiz araçlar, self-host projeler, CRM, ERP ve AI projeleri için Türkçe incelemeler ve güncel haberler.",
  path: "/open-source",
  keywords: [
    "open source",
    "açık kaynak yazılımlar",
    "ücretsiz açık kaynak araçlar",
    "açık kaynak CRM",
    "self-host projeler",
    "GitHub açık kaynak projeler",
  ],
});

export default function OpenSourcePage() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "Open Source",
            description:
              "Açık kaynak yazılımlar, ücretsiz araçlar ve self-host projeler için Türkçe incelemeler.",
            url: "/open-source",
            itemType: "Article",
            items: items.slice(0, 20).map((item) => ({
              name: item.title,
              url: `${SITE.url}${item.href}`,
              description: item.description,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Open Source", href: "/open-source" },
          ]),
        ]}
      />

      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Open Source", href: "/open-source" },
          ]}
        />
        <PageHeader
          title="Open Source"
          description="Açık kaynak yazılımlar, ücretsiz araçlar ve self-host projeler."
        />
        <FilterableContentList
          items={items}
          categories={CATEGORIES}
          filterKey="type"
          emptyMessage="Bu bölümde henüz açık kaynak içerik yok."
        />
      </section>
    </>
  );
}
