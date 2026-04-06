// ─────────────────────────────────────────────────────────────
// AI Rehber — Chapter Navigation (Bölümler Arası Navigasyon)
// Rehber bölümleri arasında önceki/sonraki + progress dots
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

type ChapterNavProps = {
  guide: string;
  guideTitle: string;
  currentChapter: number;
  totalChapters: number;
  prev: { slug: string; title: string; chapter: number } | null;
  next: { slug: string; title: string; chapter: number } | null;
  className?: string;
};

export function ChapterNav({
  guide,
  guideTitle,
  currentChapter,
  totalChapters,
  prev,
  next,
  className,
}: ChapterNavProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.04] bg-surface-1 p-5",
        className
      )}
    >
      {/* Series header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-4 w-4 text-primary-500" />
        <span className="text-sm font-semibold text-gray-300">
          {guideTitle}
        </span>
        <span className="text-xs text-gray-500 font-sans">
          {currentChapter}/{totalChapters}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: totalChapters }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i + 1 === currentChapter
                ? "bg-primary-500"
                : i + 1 < currentChapter
                  ? "bg-primary-500/30"
                  : "bg-white/[0.06]"
            )}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <div className="flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/programlama/${guide}/${prev.slug}`}
            className="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-gray-600 block">
                Önceki — Bölüm {prev.chapter}
              </span>
              <span className="truncate block max-w-[200px]">{prev.title}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/programlama/${guide}/${next.slug}`}
            className="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors text-right"
          >
            <div className="min-w-0">
              <span className="text-[10px] text-gray-600 block">
                Sonraki — Bölüm {next.chapter}
              </span>
              <span className="truncate block max-w-[200px]">{next.title}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        ) : (
          <Link
            href={`/programlama/${guide}`}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <span>Rehber Tamamlandı!</span>
          </Link>
        )}
      </div>
    </div>
  );
}
