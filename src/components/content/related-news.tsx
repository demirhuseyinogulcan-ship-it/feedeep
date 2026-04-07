// ─────────────────────────────────────────────────────────────
// feedeep — İlgili Haberler Komponenti
// Anasayfadaki feed kartıyla birebir aynı görünüm
// SEO: İç link ağı güçlendirmesi, bounce rate düşürme
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

type RelatedItem = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categoryLabel: string;
  editorPick?: boolean;
  image?: string;
  imageAlt?: string;
  blurDataURL?: string;
  sourceName?: string;
};

interface RelatedNewsProps {
  items: RelatedItem[];
}

export function RelatedNews({ items }: RelatedNewsProps) {
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => {
    if (a.editorPick && !b.editorPick) return -1;
    if (!a.editorPick && b.editorPick) return 1;
    return 0;
  });

  return (
    <section className="mt-16 pt-8 border-t border-white/[0.04]">
      <h2 className="text-xs font-sans tracking-widest uppercase text-gray-600 mb-8">
        İlgili Haberler
      </h2>
      <div className="space-y-6 sm:space-y-8">
        {sorted.map((item, i) => (
          <div key={item.slug}>
            {i > 0 && (
              <div className="mx-auto w-12 h-px bg-white/[0.04] mb-6 sm:mb-8" />
            )}
            <Link
              href={`/haberler/${item.slug}`}
              className="group block rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 overflow-hidden"
            >
              {/* Post header */}
              <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary-400">H</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-300">
                    {item.sourceName ?? item.categoryLabel}
                  </p>
                  <p className="text-[10px] text-gray-600">{formatDate(item.date)}</p>
                </div>
                <span className="ml-auto text-[9px] font-sans tracking-widest uppercase text-primary-400/50 border border-primary-400/20 rounded-full px-2 py-0.5">
                  Haber
                </span>
              </div>

              {/* Full-width görsel */}
              <div className="relative aspect-[16/9] overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.imageAlt ?? item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 640px"
                    {...(item.blurDataURL
                      ? { placeholder: "blur" as const, blurDataURL: item.blurDataURL }
                      : {})}
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-1 void-grid">
                    <div
                      className="absolute inset-0 animate-breathe"
                      style={{
                        background:
                          "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.08) 0%, transparent 60%)",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Post body */}
              <div className="px-4 pt-3.5 pb-2 sm:px-5">
                <h3 className="text-[15px] sm:text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Post footer */}
              <div className="flex items-center justify-end px-4 pb-4 sm:px-5 sm:pb-5 pt-1">
                <span className="text-xs text-primary-400/60 group-hover:text-primary-400 transition-colors">
                  Devamını oku &rarr;
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
