// ─────────────────────────────────────────────────────────────
// AI Rehber — Search UI (Client Component)
// İçeriklerde anlık arama — client-side text match
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export interface SearchItem {
  title: string;
  description: string;
  href: string;
  type: string;
  date: string;
}

interface SearchUIProps {
  items: SearchItem[];
}

export function SearchUI({ items }: SearchUIProps) {
  const [query, setQuery] = useState("");

  const results =
    query.length >= 2
      ? items.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  return (
    <>
      <input
        type="search"
        placeholder="Aramak istediğiniz kelimeyi yazın..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-white/[0.04] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 mb-8"
        autoFocus
      />

      {query.length >= 2 && (
        <p className="text-[11px] text-gray-600 mb-6">
          {results.length} sonuç bulundu
        </p>
      )}

      <div className="space-y-6">
        {results.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group block animate-fade-up"
          >
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/50">
                {item.type}
              </span>
              <span className="text-[10px] text-gray-800">
                {formatDate(item.date)}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-200 group-hover:text-gray-100 transition-colors text-glow">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          </Link>
        ))}
      </div>

      {query.length >= 2 && results.length === 0 && (
        <p className="text-gray-600 text-sm">
          &ldquo;{query}&rdquo; için sonuç bulunamadı.
        </p>
      )}
    </>
  );
}
