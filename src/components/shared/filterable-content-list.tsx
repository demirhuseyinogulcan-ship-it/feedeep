// ─────────────────────────────────────────────────────────────
// feedeep — Filterable Content List (Client Component)
// Kategori filtreleme + feed card görünümü — tüm listing sayfalarında kullanılır
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, Fragment } from "react";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/feed";
import { FeedCard } from "@/components/feed/feed-card";

interface Category {
  key: string;
  label: string;
}

interface FilterableContentListProps {
  items: FeedItem[];
  categories?: Category[];
  emptyMessage?: string;
}

export function FilterableContentList({
  items,
  categories = [],
  emptyMessage = "Henüz içerik yok.",
}: FilterableContentListProps) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? items.filter((item) => item.category === active)
    : items;

  return (
    <>
      {/* Kategori Filtreleri */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              !active
                ? "bg-surface-3 text-gray-200"
                : "text-gray-600 hover:text-gray-400"
            )}
            aria-pressed={!active}
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActive(cat.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                active === cat.key
                  ? "bg-surface-3 text-gray-200"
                  : "text-gray-600 hover:text-gray-400"
              )}
              aria-pressed={active === cat.key}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* İçerik Listesi — Feed Card formatı (anasayfayla birebir aynı) */}
      <div className="pt-4 space-y-6 sm:space-y-8">
        {filtered.map((item, i) => (
          <Fragment key={item.id}>
            {i > 0 && (
              <div className="mx-auto w-12 h-px bg-white/[0.04]" />
            )}
            <FeedCard item={item} index={i} />
          </Fragment>
        ))}
      </div>

      {/* Boş Durum */}
      {filtered.length === 0 && (
        <p className="text-gray-600 text-sm">{emptyMessage}</p>
      )}
    </>
  );
}
