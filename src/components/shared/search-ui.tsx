// ─────────────────────────────────────────────────────────────
// feedeep — Search UI (Client Component)
// Fuse.js ile fuzzy, relevance-based arama.
//
// İndeks lazy-fetch: kullanıcı input'a odaklandığında
// /api/search-index'den bir kez çekilir.
// Bu sayede initial HTML'ye items dizisi seri­alize edilmez.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { formatDate } from "@/lib/utils";

export interface SearchItem {
  title: string;
  description: string;
  href: string;
  type: string;
  date: string;
}

export function SearchUI() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const fetchedRef = useRef(false);

  // İlk odaklanmada indeksi bir kez çek
  const ensureIndex = useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/search-index")
      .then((r) => r.json() as Promise<SearchItem[]>)
      .then((data) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  const fuse = useMemo(() => {
    if (!items) return null;
    return new Fuse(items, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "description", weight: 0.3 },
        { name: "type", weight: 0.2 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [items]);

  const results = useMemo(() => {
    if (!fuse || query.length < 2) return [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query]);

  return (
    <>
      <input
        type="search"
        placeholder="Aramak istediğiniz kelimeyi yazın..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={ensureIndex}
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
              <span className="text-[10px] font-sans tracking-widest uppercase text-primary-400/50">
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
