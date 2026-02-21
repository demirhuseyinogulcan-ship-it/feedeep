// ─────────────────────────────────────────────────────────────
// AI Rehber — Search Page
// Tüm içeriklerde arama yapma sayfası
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { yazilar, haberler, promptlar } from "#site/content";
import { generateMeta } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { SearchUI, type SearchItem } from "@/components/shared/search-ui";

export const metadata: Metadata = generateMeta({
  title: "Ara",
  description: "AI Rehber içeriklerinde arama yapın.",
  path: "/arama",
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
    ...promptlar
      .filter((p) => p.published)
      .map((p) => ({
        title: p.title,
        description: p.description,
        href: `/prompt-kutuphanesi/${p.slug}`,
        type: "Prompt",
        date: p.date,
      })),
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <PageHeader
        title="Ara"
        description="Yazılar, haberler ve promptlarda arayın."
      />
      <SearchUI items={items} />
    </section>
  );
}
