// ─────────────────────────────────────────────────────────────
// AI Rehber — Feed Container (Client Component)
// Sonsuz scroll + filtre yönetimi + newsletter enjeksiyonu
// İleride: beğen/kaydet butonları, üyelik sistemi buraya eklenir
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import type { FeedItem, FeedFilterKey } from "@/lib/feed";
import { FeedFilters } from "./feed-filters";
import { FeedCard } from "./feed-card";
import { NewsletterForm } from "@/components/shared/newsletter-form";

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;
const NEWSLETTER_INTERVAL = 8;

type Props = {
  items: FeedItem[];
};

export function FeedContainer({ items }: Props) {
  const [filter, setFilter] = useState<FeedFilterKey>("tumu");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Filtre değişince görünür sayıyı da sıfırla
  const handleFilterChange = (key: FeedFilterKey) => {
    setFilter(key);
    setVisibleCount(INITIAL_COUNT);
  };

  // Filtrelenmiş öğeler
  const filtered = useMemo(
    () =>
      filter === "tumu" ? items : items.filter((i) => i.type === filter),
    [items, filter],
  );

  // Tip bazlı sayaçlar
  const counts = useMemo(() => {
    const c: Record<FeedFilterKey, number> = {
      tumu: items.length,
      haber: 0,
      yazi: 0,
      prompt: 0,
      haftalik: 0,
    };
    for (const item of items) {
      c[item.type]++;
    }
    return c;
  }, [items]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // IntersectionObserver ile sonsuz scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_COUNT, filtered.length),
          );
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-0">
      {/* Sticky filter tabs — header (h-14) altında */}
      <div className="sticky top-14 z-30 bg-surface-0/80 backdrop-blur-md border-b border-white/[0.04] -mx-4 px-4 sm:mx-0 sm:px-0">
        <FeedFilters active={filter} onChange={handleFilterChange} counts={counts} />
      </div>

      {/* Feed akışı */}
      <div className="pt-4 space-y-4">
        {visible.map((item, i) => (
          <Fragment key={item.id}>
            <FeedCard item={item} index={i} />

            {/* Her N karttan sonra newsletter CTA */}
            {(i + 1) % NEWSLETTER_INTERVAL === 0 &&
              i < visible.length - 1 && (
                <div className="py-2 animate-fade-up">
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5">
                    <p className="text-xs font-mono tracking-widest uppercase text-gray-600 mb-2">
                      İç Çember
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Her Pazartesi — yapay zeka fırsatları ve ipuçları.
                    </p>
                    <NewsletterForm />
                  </div>
                </div>
              )}
          </Fragment>
        ))}
      </div>

      {/* Sonsuz scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
      )}

      {/* Akış sonu */}
      {!hasMore && filtered.length > 0 && (
        <p className="py-12 text-center text-xs font-mono text-gray-800">
          Tüm içerikleri gördün
        </p>
      )}

      {/* Boş filtre durumu */}
      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-gray-600">
          Bu kategoride henüz içerik yok.
        </p>
      )}
    </div>
  );
}
