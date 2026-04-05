// ─────────────────────────────────────────────────────────────
// AI Rehber — Yazı/Analiz Feed Card (Sosyal Medya Post Formatı)
// Full-width görsel + kategori header + başlık + açıklama + footer
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
        {/* Post header — kategori + tarih */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <div className="w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary-400">A</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-300">{item.categoryLabel}</p>
            <p className="text-[10px] text-gray-600">{formatDate(item.date)}</p>
          </div>
          <span className="ml-auto text-[9px] font-mono tracking-widest uppercase text-primary-400/50 border border-primary-400/20 rounded-full px-2 py-0.5">
            Analiz
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

        {/* Post body — başlık + açıklama */}
        <div className="px-4 pt-3.5 pb-2 sm:px-5">
          <h3 className="text-[15px] sm:text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Post footer */}
        <div className="flex items-center justify-between px-4 pb-4 sm:px-5 sm:pb-5 pt-1">
          <div className="flex items-center gap-3 text-[10px] font-mono text-gray-700">
            <span>{item.readingTime} dk okuma</span>
            <span aria-hidden="true">·</span>
            <span>Güven: {CONFIDENCE_LABEL[item.confidence] ?? item.confidence}</span>
          </div>
          <span className="text-xs text-primary-400/60 group-hover:text-primary-400 transition-colors">
            Yazıyı oku &rarr;
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}
