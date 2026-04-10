// ─────────────────────────────────────────────────────────────
// feedeep — Search Index Route Handler
//
// Build-time'da statik olarak pre-render edilir (force-static).
// SearchUI bu endpoint'i ilk kullanım anında bir kez fetch eder.
//
// Optimizasyon:
// - description 100 karakterle kesilir (payload boyutunu düşürür)
// - category ve keywords eklenir (arama kalitesini artırır)
// - İçerik 2000+ olduğunda Supabase FTS'e geçilecek (Aşama 2)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { yazilar, haberler } from "#site/content";
import type { SearchItem } from "@/components/shared/search-ui";

export const dynamic = "force-static";

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "\u2026";
}

export function GET() {
  const items: SearchItem[] = [
    ...yazilar
      .filter((y) => y.published)
      .map((y) => ({
        title: y.title,
        description: truncate(y.description, 100),
        href: `/yazilar/${y.slug}`,
        type: "Yazı",
        date: y.date,
        category: y.category,
        keywords: y.keywords,
      })),
    ...haberler
      .filter((h) => h.published)
      .map((h) => ({
        title: h.title,
        description: truncate(h.description, 100),
        href: `/haberler/${h.slug}`,
        type: "Haber",
        date: h.date,
        category: h.category,
        keywords: h.keywords,
      })),
  ];

  return NextResponse.json(items);
}
