// ─────────────────────────────────────────────────────────────
// AI Rehber — Haftalık Brifing Feed Card
// Geniş: hafta numarası + 3 highlight başlığı görünür
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
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
      <Link href={item.href} className="group block p-4 sm:p-5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/80">
            Haftalık Brifing
          </span>
          <span className="text-[10px] text-gray-800" aria-hidden="true">
            ·
          </span>
          <span className="text-[10px] font-mono text-gray-600">
            W{String(item.weekNumber).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-gray-800" aria-hidden="true">
            ·
          </span>
          <span className="text-[10px] text-gray-700">
            {formatDate(item.date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow mb-3">
          {item.title}
        </h3>

        {/* Highlights */}
        {item.highlights.length > 0 && (
          <ul className="space-y-1.5 mb-3">
            {item.highlights.map((hl, i) => (
              <li
                key={i}
                className="flex items-baseline gap-2 text-sm text-gray-500"
              >
                <span className="text-[10px] font-mono text-gray-700 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug">{hl.title}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <span className="text-xs text-primary-400/70 group-hover:text-primary-400 transition-colors">
          Brifing&apos;i oku &rarr;
        </span>
      </Link>
    </TiltCard>
  );
}
