// ─────────────────────────────────────────────────────────────
// AI Rehber — Article Header (DRY shared component)
// Yazı ve haber detay sayfaları için ortak başlık bölümü
// ─────────────────────────────────────────────────────────────

import { formatDate } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { ViewCounter } from "@/components/shared/view-counter";

interface ArticleHeaderProps {
  title: string;
  description: string;
  categoryLabel: string;
  date: string;
  updated?: string;
  readingTime?: number;
  author?: string;
  sourceName?: string;
  slug?: string;
  contentType?: "yazi" | "haber" | "prompt";
}

export function ArticleHeader({
  title,
  description,
  categoryLabel,
  date,
  updated,
  readingTime,
  author = SITE.author.name,
  sourceName,
  slug,
  contentType = "yazi",
}: ArticleHeaderProps) {
  return (
    <header className="mb-12 animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/50">
          {categoryLabel}
        </span>
        {readingTime && (
          <>
            <span className="text-[10px] text-gray-800">/</span>
            <span className="text-[10px] font-mono tracking-wider text-gray-600">
              {readingTime} dk okuma
            </span>
          </>
        )}
        {sourceName && (
          <>
            <span className="text-[10px] text-gray-800">/</span>
            <span className="text-[10px] font-mono tracking-wider text-gray-600">
              {sourceName}
            </span>
          </>
        )}
        {slug && (
          <>
            <span className="text-[10px] text-gray-800">/</span>
            <ViewCounter slug={slug} publishDate={date} type={contentType} />
          </>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 tracking-tight leading-tight">
        {title}
      </h1>
      <p className="mt-4 text-gray-500 leading-relaxed" data-description="">{description}</p>

      <div className="mt-6 flex items-center gap-4 text-[11px] text-gray-600">
        <span>{author}</span>
        <span className="text-gray-800">·</span>
        <time dateTime={date}>{formatDate(date)}</time>
        {updated && updated !== date && (
          <>
            <span className="text-gray-800">·</span>
            <span>Güncelleme: {formatDate(updated)}</span>
          </>
        )}
      </div>
    </header>
  );
}
