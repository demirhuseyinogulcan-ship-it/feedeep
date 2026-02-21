// ─────────────────────────────────────────────────────────────
// AI Rehber — İlgili Haberler Komponenti
// Aynı kategoriden veya ortak keyword'lere sahip haberler
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
};

interface RelatedNewsProps {
  items: RelatedItem[];
}

export function RelatedNews({ items }: RelatedNewsProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-white/[0.04]">
      <h2 className="text-xs font-mono tracking-widest uppercase text-gray-600 mb-6">
        İlgili Haberler
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/haberler/${item.slug}`}
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
            </div>
            <h3 className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors line-clamp-2">
              {item.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
