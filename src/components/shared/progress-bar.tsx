// ─────────────────────────────────────────────────────────────
// AI Rehber — Progress Bar (DRY shared component)
// Benchmark skorları ve model puanları için erişilebilir bar
// ─────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  note?: string;
  className?: string;
}

export function ProgressBar({
  label,
  value,
  maxValue = 100,
  note,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm text-gray-400 w-28 truncate" title={label}>
        {label}
      </span>
      <div
        className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
        aria-label={`${label}: ${value}/${maxValue}`}
      >
        <div
          className="h-full bg-gray-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-sans text-gray-600 tabular-nums w-14 text-right">
        {value}
        {maxValue !== 100 ? `/${maxValue}` : ""}
      </span>
      {note && (
        <span className="text-[10px] text-gray-700 hidden sm:inline truncate max-w-[120px]">
          {note}
        </span>
      )}
    </div>
  );
}
