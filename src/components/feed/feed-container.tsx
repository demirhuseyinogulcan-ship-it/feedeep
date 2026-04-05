// ─────────────────────────────────────────────────────────────
// AI Rehber — Feed Container (Client Component)
// Sonsuz scroll + newsletter enjeksiyonu
// İleride: beğen/kaydet butonları, üyelik sistemi buraya eklenir
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import type { FeedItem } from "@/lib/feed";
import { FeedCard } from "./feed-card";
import { NewsletterForm } from "@/components/shared/newsletter-form";

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;
const NEWSLETTER_INTERVAL = 8;

type Props = {
  items: FeedItem[];
};

export function FeedContainer({ items }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

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
      {!hasMore && items.length > 0 && (
        <p className="py-12 text-center text-xs font-mono text-gray-800">
          Tüm içerikleri gördün
        </p>
      )}
    </div>
  );
}
