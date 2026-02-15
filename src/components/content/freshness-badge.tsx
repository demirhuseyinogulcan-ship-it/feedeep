// ─────────────────────────────────────────────────────────────
// AI Rehber — Freshness Badge (Güncellik Rozeti)
// Monochrome void style
// ─────────────────────────────────────────────────────────────

import { getFreshness } from "@/lib/utils";
import { cn } from "@/lib/utils";

type FreshnessBadgeProps = {
  lastChecked: string;
  className?: string;
};

export function FreshnessBadge({ lastChecked, className }: FreshnessBadgeProps) {
  const freshness = getFreshness(lastChecked);

  return (
    <span
      className={cn(
        "text-[10px] font-mono tracking-wider text-gray-600",
        className
      )}
      title={`Son kontrol: ${new Date(lastChecked).toLocaleDateString("tr-TR")}`}
    >
      {freshness.label}
    </span>
  );
}
