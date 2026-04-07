"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — "Sahip Ol" Butonu
// Tipografik, ikonsuz. Toggle davranışı.
// Props alır — state SignalBar'da yönetilir.
// ─────────────────────────────────────────────────────────────

import { useCallback, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import type { Signal, ArticleStats } from "@/lib/signals";

type Props = {
  signal: Signal;
  stats: ArticleStats;
  toggleOwn: () => void;
  /** Detay sayfasında daha büyük gösterim */
  size?: "sm" | "lg";
  className?: string;
};

export function OwnButton({ signal, stats, toggleOwn, size = "sm", className }: Props) {
  const { user, requestAuth } = useAuth();
  const [animate, setAnimate] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) { requestAuth(); return; }
      toggleOwn();
      if (!signal.owned) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 400);
      }
    },
    [toggleOwn, signal.owned, user, requestAuth]
  );

  const isLg = size === "lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative font-heading font-semibold tracking-wide uppercase transition-all duration-200 select-none",
        "rounded-md",
        isLg ? "text-xs px-4 py-2" : "text-[11px] px-3 py-1.5",
        signal.owned
          ? "bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]"
          : "border border-white/[0.08] bg-transparent text-gray-400 hover:text-gray-200 hover:border-primary-500/40 hover:bg-primary-500/10",
        animate && "signal-pulse",
        className
      )}
    >
      {signal.owned ? "Sahiplendin" : "Sahip Ol"}
      {stats.totalOwners > 0 && (
        <span className="ml-1.5 text-[10px] font-sans font-normal opacity-60">
          {stats.totalOwners}
        </span>
      )}
    </button>
  );
}
