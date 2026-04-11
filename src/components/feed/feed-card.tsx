// ─────────────────────────────────────────────────────────────
// feedeep — Feed Card
// HaberFeedItem ve YaziFeedItem için tek birleşik kart.
// Farklar (avatar harfi, header etiketi, badge, line-clamp)
// discriminated union'dan türetilir.
// ─────────────────────────────────────────────────────────────

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FeedItem } from "@/lib/feed";
import { timeAgo } from "@/lib/utils";
import { TiltCard } from "@/components/shared/tilt-card";
import { SignalBar } from "@/components/signals/signal-bar";
import { CommentSection } from "@/components/signals/comment-section";

const VOID_GRADIENT: CSSProperties = {
  background:
    "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.08) 0%, transparent 60%)",
};

const DELAY_STYLES: CSSProperties[] = Array.from({ length: 6 }, (_, i) => ({
  animationDelay: `${i * 60}ms`,
}));

function getDelayStyle(index: number): CSSProperties {
  return DELAY_STYLES[Math.min(index, 5)];
}

type Props = { item: FeedItem; index: number };

export function FeedCard({ item, index }: Props) {
  const isHaber = item.type === "haber";
  const avatarLetter = isHaber ? "H" : "A";
  const headerLabel = isHaber ? item.sourceName : item.categoryLabel;
  const badge = isHaber ? "Haber" : "Analiz";
  const descriptionClamp = isHaber ? "line-clamp-2" : "line-clamp-3";

  return (
    <TiltCard
      className="rounded-xl overflow-hidden animate-fade-up border border-white/[0.06]"
      style={getDelayStyle(index)}
    >
      <Link href={item.href} className="group block">
        {/* Post header */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isHaber ? "bg-primary-500/10" : "bg-primary-500/15"
            }`}
          >
            <span className="text-[10px] font-bold text-primary-400">{avatarLetter}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-300">{headerLabel}</p>
            <p className="text-[10px] text-gray-500">{timeAgo(item.publishedAt)}</p>
          </div>
          <span className="ml-auto text-[9px] font-sans tracking-widest uppercase text-primary-400/50 border border-primary-400/20 rounded-full px-2 py-0.5">
            {badge}
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
              placeholder={item.blurDataURL ? "blur" : "empty"}
              blurDataURL={item.blurDataURL}
            />
          ) : (
            <div className="absolute inset-0 bg-surface-1 void-grid">
              <div className="absolute inset-0 animate-breathe" style={VOID_GRADIENT} />
            </div>
          )}
        </div>

        {/* Post body */}
        <div className="px-4 pt-3.5 pb-2 sm:px-5">
          <h3 className="text-[15px] sm:text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
            {item.title}
          </h3>
          <p className={`mt-2 text-sm text-gray-500 leading-relaxed ${descriptionClamp}`}>
            {item.description}
          </p>
        </div>
      </Link>

      {/* Sinyal Çubuğu */}
      <div className="px-4 pb-3 sm:px-5 sm:pb-3">
        <SignalBar articleId={item.id} />
      </div>

      {/* Yorum Önizleme */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <CommentSection articleId={item.id} preview previewCount={3} />
      </div>
    </TiltCard>
  );
}

