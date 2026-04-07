// ─────────────────────────────────────────────────────────────
// feedeep — Series Navigation (Seri İçerik Navigasyonu)
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

type SeriesItem = {
  title: string;
  slug: string;
  order: number;
};

type SeriesNavProps = {
  seriesName: string;
  currentOrder: number;
  items: SeriesItem[];
  className?: string;
};

export function SeriesNav({
  seriesName,
  currentOrder,
  items,
  className,
}: SeriesNavProps) {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((item) => item.order === currentOrder);
  const prev = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const next = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-700 bg-surface-1 p-5 my-8",
        className
      )}
    >
      {/* Series header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-4 w-4 text-primary-500" />
        <span className="text-sm font-semibold text-gray-300">
          {seriesName}
        </span>
        <span className="text-xs text-gray-400">
          {currentOrder}/{sorted.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-4">
        {sorted.map((item) => (
          <div
            key={item.order}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              item.order === currentOrder
                ? "bg-primary-500"
                : item.order < currentOrder
                  ? "bg-primary-200"
                  : "bg-gray-700"
            )}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <div className="flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/yazilar/${prev.slug}`}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/yazilar/${next.slug}`}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
          >
            <span className="truncate max-w-[200px]">{next.title}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
