// ─────────────────────────────────────────────────────────────
// AI Rehber — Search Page
// Tüm içeriklerde arama yapma sayfası
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { yazilar, haberler, rehberler } from "#site/content";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { SearchUI, type SearchItem } from "@/components/shared/search-ui";

export const metadata: Metadata = generateMeta({
  title: "Ara",
  description: "feedeep içeriklerinde arama yapın.",
  path: "/arama",
  noIndex: true,
});

export default function AramaPage() {
  const items: SearchItem[] = [
    ...yazilar
      .filter((y) => y.published)
      .map((y) => ({
        title: y.title,
        description: y.description,
        href: `/yazilar/${y.slug}`,
        type: "Yazı",
        date: y.date,
      })),
    ...haberler
      .filter((h) => h.published)
      .map((h) => ({
        title: h.title,
        description: h.description,
        href: `/haberler/${h.slug}`,
        type: "Haber",
        date: h.date,
      })),
    ...rehberler
      .filter((r) => r.published)
      .map((r) => ({
        title: `${r.guideTitle} — Bölüm ${r.chapter}: ${r.title}`,
        description: r.description,
        href: `/programlama/${r.guide}/${r.slug}`,
        type: "Ders",
        date: r.date,
      })),
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", href: "/" },
          { name: "Ara", href: "/arama" },
        ])}
      />
      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Ara", href: "/arama" },
          ]}
        />
        <PageHeader
          title="Ara"
          description="Yazılar, haberler ve programlama derslerinde arayın."
      />
        <SearchUI items={items} />
      </section>
    </>
  );
}
