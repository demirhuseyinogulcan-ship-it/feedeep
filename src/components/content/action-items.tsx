// ─────────────────────────────────────────────────────────────
// AI Rehber — Action Items Component
// Monochrome void style
// ─────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";

type ActionItemsProps = {
  items: string[];
  className?: string;
};

export function ActionItems({ items, className }: ActionItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("mt-10 pt-6 border-t border-white/[0.04]", className)}>
      <span className="text-[10px] font-sans tracking-widest uppercase text-gray-700 block mb-4">
        Şimdi Yapabileceklerin
      </span>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-baseline gap-3 text-sm text-gray-400"
          >
            <span className="text-[11px] font-sans text-gray-700 tabular-nums flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
