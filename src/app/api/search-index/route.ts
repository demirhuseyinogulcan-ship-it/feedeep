// feedeep — Statik Arama İndeksi API Route
// Build zamanında pre-render edilir (force-static).
// SearchUI onFocus'ta bu endpoint'i bir kez lazy-fetch yapar.
// Büyük içerik hacminde ilk sayfa yükünü hafifletir.

import { NextResponse } from "next/server";
import { yazilar, haberler } from "#site/content";

export const dynamic = "force-static";

export type SearchIndexItem = {
  title: string;
  description: string;
  href: string;
  type: string;
  date: string;
};

export async function GET() {
  const items: SearchIndexItem[] = [
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
  ];

  return NextResponse.json(items);
}
