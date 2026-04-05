// ─────────────────────────────────────────────────────────────
// AI Rehber — Haber Feed Card
// Kompakt: thumbnail sol, kaynak + tarih + başlık sağ
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import type { HaberFeedItem } from "@/lib/feed";
import { formatDate } from "@/lib/utils";
import { TiltCard } from "@/components/shared/tilt-card";

type Props = { item: HaberFeedItem; index: number };

export function HaberCard({ item, index }: Props) {
  return (
    <TiltCard
      className="rounded-xl overflow-hidden animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <Link href={item.href} className="group block p-4 sm:p-5">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-[68px] relative rounded-lg overflow-hidden">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.imageAlt ?? item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="96px"
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
                      "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.1) 0%, transparent 60%)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/60">
                Haber
              </span>
              <span className="text-[10px] text-gray-800" aria-hidden="true">
                ·
              </span>
              <span className="text-[10px] font-mono tracking-wider text-gray-600">
                {item.sourceName}
              </span>
              <span className="text-[10px] text-gray-800" aria-hidden="true">
                ·
              </span>
              <span className="text-[10px] text-gray-700">
                {formatDate(item.date)}
              </span>
            </div>

            <h3 className="text-sm sm:text-[15px] font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
              {item.title}
            </h3>

            <p className="mt-1.5 text-xs text-gray-600 leading-relaxed line-clamp-2 hidden sm:block">
              {item.description}
            </p>

            <span className="mt-2 text-[10px] font-mono text-gray-700 block">
              {item.readingTime} dk okuma
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
