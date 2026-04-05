// ─────────────────────────────────────────────────────────────
// AI Rehber — Prompt Feed Card (Sosyal Medya Post Formatı)
// Header + code preview (görsel yerine) + başlık + footer
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import type { PromptFeedItem } from "@/lib/feed";
import { formatDate } from "@/lib/utils";
import { TiltCard } from "@/components/shared/tilt-card";

type Props = { item: PromptFeedItem; index: number };

export function PromptFeedCard({ item, index }: Props) {
  return (
    <TiltCard
      className="rounded-xl overflow-hidden animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <Link href={item.href} className="group block">
        {/* Post header — zorluk + tarih */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-emerald-400">P</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-300">Prompt Kutuphanesi</p>
            <p className="text-[10px] text-gray-600">{formatDate(item.date)}</p>
          </div>
          <span className="ml-auto text-[9px] font-mono tracking-widest uppercase text-emerald-400/50 border border-emerald-400/20 rounded-full px-2 py-0.5">
            {item.difficultyLabel}
          </span>
        </div>

        {/* Prompt kodu gorunumu (gorsel yerine) */}
        <div className="mx-4 sm:mx-5 rounded-lg bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04]">
            <span className="w-2 h-2 rounded-full bg-red-500/40" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/40" />
            <span className="w-2 h-2 rounded-full bg-green-500/40" />
            <span className="ml-2 text-[9px] font-mono text-gray-700">{item.categoryLabel}</span>
          </div>
          <pre className="text-xs font-mono text-gray-400 p-3 sm:p-4 whitespace-pre-wrap line-clamp-4 leading-relaxed">
            {item.promptPreview}
          </pre>
        </div>

        {/* Post body — baslik + aciklama */}
        <div className="px-4 pt-3.5 pb-2 sm:px-5">
          <h3 className="text-[15px] sm:text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Post footer */}
        <div className="flex items-center justify-between px-4 pb-4 sm:px-5 sm:pb-5 pt-1">
          <span className="text-[10px] font-mono text-gray-700">
            {item.readingTime} dk okuma
          </span>
          <span className="text-xs text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
            Prompt&apos;u gor &rarr;
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}
