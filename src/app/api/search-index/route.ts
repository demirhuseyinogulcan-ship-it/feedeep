// ─────────────────────────────────────────────────────────────
// feedeep — Search Index Route Handler
//
// Build-time'da statik olarak pre-render edilir (force-static).
// SearchUI bu endpoint'i ilk kullanım anında bir kez fetch eder.
//
// Önceki yaklaşım: tüm SearchItem[] RSC props olarak HTML'ye seri-
// alize edilirdi → içerik büyüdükçe initial payload şişerdi.
//
// Yeni yaklaşım: items bu route'ta yaşar → route statik JSON olarak
// pre-render edilir → SearchUI lazy-fetch.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { yazilar, haberler } from "#site/content";
import type { SearchItem } from "@/components/shared/search-ui";

export const dynamic = "force-static";

export function GET() {
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
  ];

  return NextResponse.json(items);
}
