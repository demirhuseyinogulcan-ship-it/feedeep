// ─────────────────────────────────────────────────────────────
// feedeep — Feed Filters (Tab Bar)
// Sticky horizontal filter tabs — her içerik tipini filtreler
// ─────────────────────────────────────────────────────────────

import { FEED_FILTERS, type FeedFilterKey } from "@/lib/feed";

type Props = {
  active: FeedFilterKey;
  onChange: (key: FeedFilterKey) => void;
  counts: Record<FeedFilterKey, number>;
};

export function FeedFilters({ active, onChange, counts }: Props) {
  return (
    <div
      className="flex items-center gap-1 overflow-x-auto py-3"
      role="tablist"
      aria-label="İçerik filtresi"
      style={{ scrollbarWidth: "none" }}
    >
      {FEED_FILTERS.map((f) => {
        const isActive = f.key === active;
        const count = counts[f.key];

        return (
          <button
            key={f.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(f.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? "bg-white/[0.08] text-gray-100"
                : "text-gray-600 hover:text-gray-300 hover:bg-white/[0.03]"
            }`}
          >
            {f.label}
            {count > 0 && (
              <span
                className={`ml-1.5 text-[10px] font-sans ${
                  isActive ? "text-gray-400" : "text-gray-700"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
