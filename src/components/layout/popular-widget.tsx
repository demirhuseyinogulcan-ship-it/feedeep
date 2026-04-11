"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — PopularWidget (Sidebar)
// En çok okunan makaleleri gösterir.
// /api/popular → Supabase get_popular_articles RPC.
// 100+ view eşiğini geçen yeterli makale yoksa widget gizlenir.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatViews } from "@/lib/utils";
import { Eye } from "lucide-react";

type PopularItem = {
  article_id: string;
  view_count: number;
};

function articleIdToHref(articleId: string): string {
  if (articleId.startsWith("haber-")) return `/haberler/${articleId.slice(6)}`;
  if (articleId.startsWith("yazi-")) return `/yazilar/${articleId.slice(5)}`;
  return "#";
}

function articleIdToLabel(articleId: string): string {
  return articleId
    .replace(/^(haber|yazi)-/, "")
    .replace(/-/g, " ");
}

function articleIdToType(articleId: string): string {
  if (articleId.startsWith("haber-")) return "Haber";
  if (articleId.startsWith("yazi-")) return "Yazi";
  return "";
}

export function PopularWidget() {
  const [items, setItems] = useState<PopularItem[]>([]);

  useEffect(() => {
    fetch("/api/popular?limit=5")
      .then((r) => r.json())
      .then((data: PopularItem[]) => {
        // Sadece 100+ view olanları göster
        setItems(data.filter((d) => d.view_count >= 100));
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <span className="text-[10px] tracking-widest uppercase text-gray-500 block px-3">
        En Cok Okunan
      </span>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.article_id}>
            <Link
              href={articleIdToHref(item.article_id)}
              className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-400 group-hover:text-gray-200 transition-colors capitalize line-clamp-2 leading-snug">
                  {articleIdToLabel(item.article_id)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] tracking-wider uppercase text-gray-700">
                    {articleIdToType(item.article_id)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-gray-700 tabular-nums">
                    <Eye className="h-2.5 w-2.5" />
                    {formatViews(item.view_count)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
