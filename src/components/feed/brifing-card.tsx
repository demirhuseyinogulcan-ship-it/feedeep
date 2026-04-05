// ─────────────────────────────────────────────────────────────
// AI Rehber — Haftalık Brifing Feed Card (Sosyal Medya Post Formatı)
// Header + highlight listesi (görsel yerine) + başlık + footer
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import type { HaftalikFeedItem } from "@/lib/feed";
import { formatDate } from "@/lib/utils";
import { TiltCard } from "@/components/shared/tilt-card";

type Props = { item: HaftalikFeedItem; index: number };

export function BrifingCard({ item, index }: Props) {
  return (
    <TiltCard
      className="rounded-xl overflow-hidden animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <Link href={item.href} className="group block">
        {/* Post header — hafta + tarih */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-amber-400">B</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-300">Haftalik Brifing</p>
            <p className="text-[10px] text-gray-600">{formatDate(item.date)}</p>
          </div>
          <span className="ml-auto text-[9px] font-mono tracking-widest uppercase text-amber-400/50 border border-amber-400/20 rounded-full px-2 py-0.5">
            W{String(item.weekNumber).padStart(2, "0")}
          </span>
        </div>

        {/* Gorsel varsa goster */}
        {item.image ? (
          <div className="relative aspect-[16/9] overflow-hidden">
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
          /* Gorsel yoksa gradient banner */
          <div className="relative aspect-[3/1] overflow-hidden bg-gradient-to-br from-amber-500/5 via-surface-1 to-primary-500/5">
            <div className="absolute inset-0 void-grid opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/[0.04]">
                W{String(item.weekNumber).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {/* Post body — baslik */}
        <div className="px-4 pt-3.5 pb-2 sm:px-5">
          <h3 className="text-[15px] sm:text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
            {item.title}
          </h3>
        </div>

        {/* Highlights listesi */}
        {item.highlights.length > 0 && (
          <div className="px-4 pb-2 sm:px-5">
            <ul className="space-y-1.5">
              {item.highlights.map((hl, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-2 text-sm text-gray-500"
                >
                  <span className="text-[10px] font-mono text-amber-400/40 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-snug">{hl.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Post footer */}
        <div className="flex items-center justify-between px-4 pb-4 sm:px-5 sm:pb-5 pt-2">
          <span className="text-[10px] font-mono text-gray-700">
            {item.readingTime} dk okuma
          </span>
          <span className="text-xs text-amber-400/60 group-hover:text-amber-400 transition-colors">
            Brifing&apos;i oku &rarr;
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}
