// ─────────────────────────────────────────────────────────────
// AI Rehber — İlgili Yazılar Komponenti
// Aynı kategoriden veya ortak keyword'lere sahip yazılar
// SEO: İç link ağı güçlendirmesi, bounce rate düşürme
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { formatDate } from "@/lib/utils";

type RelatedItem = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categoryLabel: string;
  readingTime: number;
};

interface RelatedArticlesProps {
  items: RelatedItem[];
}

export function RelatedArticles({ items }: RelatedArticlesProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-white/[0.04]">
      <h2 className="text-xs font-mono tracking-widest uppercase text-gray-600 mb-6">
        İlgili Yazılar
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/yazilar/${item.slug}`}
            className="group block p-4 rounded-lg border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-violet-500/70">
                {item.categoryLabel}
              </span>
              <span className="text-[10px] text-gray-700">•</span>
              <time
                dateTime={item.date}
                className="text-[10px] font-mono text-gray-700"
              >
                {formatDate(item.date)}
              </time>
              <span className="text-[10px] text-gray-700">•</span>
              <span className="text-[10px] font-mono text-gray-700">
                {item.readingTime} dk
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
