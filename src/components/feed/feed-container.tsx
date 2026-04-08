// ─────────────────────────────────────────────────────────────
// feedeep — Feed Container (Client Component)
// Sonsuz scroll feed akışı + batch stats pre-fetch.
// visibleCount arttıkça yeni kartlar için tek RPC çağrısı yapılır.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import type { FeedItem } from "@/lib/feed";
import type { ArticleStats } from "@/lib/signals";
import { batchFetchStats } from "@/lib/signal-batch";
import { FeedCard } from "./feed-card";

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

type Props = {
  items: FeedItem[];
};

export function FeedContainer({ items }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [statsMap, setStatsMap] = useState<Map<string, ArticleStats>>(new Map());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  // visibleCount değişince yeni görünür kartların stats'larını batch olarak çek
  useEffect(() => {
    const newIds = items
      .slice(0, visibleCount)
      .map((item) => item.id)
      .filter((id) => !fetchedIdsRef.current.has(id));

    if (newIds.length === 0) return;

    batchFetchStats(newIds).then((map) => {
      map.forEach((_, id) => fetchedIdsRef.current.add(id));
      setStatsMap((prev) => new Map([...prev, ...map]));
    }).catch((err) => {
      console.error("[FeedContainer] Batch stats hatası:", err);
    });
  }, [items, visibleCount]);

  // IntersectionObserver ile sonsuz scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_COUNT, items.length),
          );
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, items.length]);

  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-0">
      {/* Feed akışı — gönderiler arası nefes alanı */}
      <div className="pt-4 space-y-6 sm:space-y-8">
        {visible.map((item, i) => (
          <Fragment key={item.id}>
            {/* Gönderiler arası ince ayırıcı çizgi */}
            {i > 0 && (
              <div className="mx-auto w-12 h-px bg-white/[0.04]" />
            )}

            <FeedCard item={item} index={i} initialStats={statsMap.get(item.id)} />
          </Fragment>
        ))}
      </div>

      {/* Sonsuz scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
      )}

      {/* Akış sonu */}
      {!hasMore && items.length > 0 && (
        <p className="py-12 text-center text-xs font-sans text-gray-800">
          Tüm içerikleri gördün
        </p>
      )}
    </div>
  );
}
