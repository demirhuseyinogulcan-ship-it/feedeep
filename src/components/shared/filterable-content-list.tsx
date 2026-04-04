// ─────────────────────────────────────────────────────────────
// AI Rehber — Filterable Content List (Client Component)
// Kategori filtreleme + içerik listesi — tüm listing sayfalarında kullanılır
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export interface ContentItem {
  slug: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  categoryLabel?: string;
  href: string;
  meta?: string; // Ek bilgi (kaynak adı, zorluk seviyesi vb.)
  image?: string;
  imageAlt?: string;
}

interface Category {
  key: string;
  label: string;
}

interface FilterableContentListProps {
  items: ContentItem[];
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

      {/* İçerik Listesi */}
      <div className="space-y-8">
        {filtered.map((item, i) => (
          <Link
            key={item.slug}
            href={item.href}
            className="group block animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <div className={item.image ? "flex gap-5" : ""}>
              {item.image && (
                <div className="hidden sm:block shrink-0 w-32 h-20 relative rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt ?? item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="128px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {item.categoryLabel && (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/50">
                      {item.categoryLabel}
                    </span>
                  )}
                  {item.meta && (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                      {item.meta}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-800">
                    {formatDate(item.date)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-tight text-glow">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="mt-2 text-sm text-gray-600 max-w-lg leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Boş Durum */}
      {filtered.length === 0 && (
        <p className="text-gray-600 text-sm">{emptyMessage}</p>
      )}
    </>
  );
}
