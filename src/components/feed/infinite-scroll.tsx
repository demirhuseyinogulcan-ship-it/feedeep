"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — InfiniteScroll (Micro Client Component)
// Tek sorumluluk: IntersectionObserver + visibility control.
// Server Component'tan gelen children'ı dilimler ve gösterir.
// Kart markup'ı client bundle'da DEĞİL — sadece bu ~800 byte.
// ─────────────────────────────────────────────────────────────

import {
  Children,
  useState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

type Props = {
  totalCount: number;
  children: ReactNode;
};

export function InfiniteScroll({ totalCount, children }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < totalCount;

  // useMemo: children array'i her render'da yeniden dilimlenmesin.
  // visibleCount değiştiğinde yeni slice → yeni referans.
  // Aynı visibleCount → aynı referans → gereksiz child render yok.
  const visibleChildren = useMemo(
    () => Children.toArray(children).slice(0, visibleCount),
    [children, visibleCount],
  );

  // IntersectionObserver ile sonsuz scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_COUNT, totalCount),
          );
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, totalCount]);

  return (
    <>
      {/* Feed akışı — gönderiler arası nefes alanı */}
      <div className="pt-4 space-y-6 sm:space-y-8">
        {visibleChildren}
      </div>

      {/* Sonsuz scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
      )}

      {/* Akış sonu */}
      {!hasMore && totalCount > 0 && (
        <p className="py-12 text-center text-xs font-sans text-gray-800">
          Tüm içerikleri gördün
        </p>
      )}
    </>
  );
}
