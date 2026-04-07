// ─────────────────────────────────────────────────────────────
// feedeep — Trust Badge & Source List (Güven Katmanı)
// Monochrome void style
// ─────────────────────────────────────────────────────────────

import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Source = {
  url: string;
  label: string;
  tier: number;
};

type Correction = {
  date: string;
  note: string;
};

type TrustBadgeProps = {
  sources: Source[];
  confidence: "high" | "medium" | "speculative";
  lastFactChecked: string;
  corrections?: Correction[];
  className?: string;
};

const _confidenceLabel = {
  high: "Yüksek",
  medium: "Orta",
  speculative: "Spekülatif",
};

export function TrustBadge({
  sources,
  confidence,
  lastFactChecked,
  corrections = [],
  className,
}: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "mt-12 pt-6 border-t border-white/[0.04]",
        className
      )}
    >
      <span className="text-[10px] font-sans tracking-widest uppercase text-gray-700 block mb-4">
        Kaynaklar
      </span>

      {/* Source List */}
      <div className="space-y-1.5 mb-4">
        {sources.map((source, i) => (
          <div key={i} className="flex items-baseline gap-3 text-sm">
            <span className="text-[10px] font-sans text-gray-700 flex-shrink-0">
              T{source.tier}
            </span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              {source.label}
            </a>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-[10px] text-gray-800">
        <span>Son kontrol: {formatDate(lastFactChecked)}</span>
      </div>

      {/* Corrections */}
      {corrections.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <span className="text-[10px] font-sans tracking-widest uppercase text-gray-700 block mb-2">
            Düzeltmeler
          </span>
          {corrections.map((c, i) => (
            <p key={i} className="text-xs text-gray-600">
              {formatDate(c.date)} — {c.note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
