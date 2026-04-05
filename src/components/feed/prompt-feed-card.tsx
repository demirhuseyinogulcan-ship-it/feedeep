// ─────────────────────────────────────────────────────────────
// AI Rehber — Prompt Feed Card
// Özel: prompt ön izleme + zorluk seviyesi + "Prompt'u gör" CTA
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
      <Link href={item.href} className="group block p-4 sm:p-5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/60">
            Prompt
          </span>
          <span className="text-[10px] text-gray-800" aria-hidden="true">
            ·
          </span>
          <span className="text-[10px] font-mono text-gray-600">
            {item.difficultyLabel}
          </span>
          <span className="text-[10px] text-gray-800" aria-hidden="true">
            ·
          </span>
          <span className="text-[10px] text-gray-700">
            {formatDate(item.date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-[15px] font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow mb-3">
          {item.title}
        </h3>

        {/* Prompt preview */}
        <pre className="text-xs font-mono text-gray-500 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 whitespace-pre-wrap line-clamp-3 leading-relaxed">
          {item.promptPreview}
        </pre>

        {/* CTA */}
        <span className="mt-3 text-xs text-primary-400/70 group-hover:text-primary-400 transition-colors block">
          Prompt&apos;u gör &rarr;
        </span>
      </Link>
    </TiltCard>
  );
}
