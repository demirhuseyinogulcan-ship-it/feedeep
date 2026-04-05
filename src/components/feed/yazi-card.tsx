// ─────────────────────────────────────────────────────────────
// AI Rehber — Yazı/Analiz Feed Card
// Geniş: görsel üstte, açıklama + okuma süresi + güven rozeti
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import type { YaziFeedItem } from "@/lib/feed";
import { formatDate } from "@/lib/utils";
import { TiltCard } from "@/components/shared/tilt-card";

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "Yüksek",
  medium: "Orta",
  speculative: "Spekülatif",
};

type Props = { item: YaziFeedItem; index: number };

export function YaziCard({ item, index }: Props) {
  return (
    <TiltCard
      className="rounded-xl overflow-hidden animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <Link href={item.href} className="group block">
        {/* Cover image */}
        {item.image ? (
          <div className="relative aspect-[2/1] overflow-hidden">
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
          </div>
        ) : (
          <div className="relative aspect-[3/1] bg-surface-1 void-grid">
            <div
              className="absolute inset-0 animate-breathe"
              style={{
                background:
                  "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.08) 0%, transparent 60%)",
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/80">
              {item.categoryLabel}
            </span>
            <span className="text-[10px] text-gray-800" aria-hidden="true">
              ·
            </span>
            <span className="text-[10px] text-gray-700">
              {formatDate(item.date)}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
            {item.title}
          </h3>

          <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
            {item.description}
          </p>

          <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-gray-700">
            <span>{item.readingTime} dk okuma</span>
            <span aria-hidden="true">·</span>
            <span>Güven: {CONFIDENCE_LABEL[item.confidence] ?? item.confidence}</span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
