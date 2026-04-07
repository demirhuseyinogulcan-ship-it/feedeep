"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Beğen / Beğenme (Upvote / Downvote)
// Reddit tarz. Tipografik — ok işaretleri, ikon değil.
// Props alır — state SignalBar'da yönetilir.
// ─────────────────────────────────────────────────────────────

import { useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import type { Signal, ArticleStats, VoteType } from "@/lib/signals";

type Props = {
  signal: Signal;
  stats: ArticleStats;
  toggleVote: (type: VoteType) => void;
  size?: "sm" | "lg";
  className?: string;
};

export function VoteButtons({ signal, stats, toggleVote, size = "sm", className }: Props) {
  const { user, requestAuth } = useAuth();
  const vote = signal.vote;

  const handleVote = useCallback(
    (type: "upvote" | "downvote") => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) { requestAuth(); return; }
      toggleVote(type);
    },
    [toggleVote, user, requestAuth]
  );

  const isLg = size === "lg";
  const netScore = stats.totalUpvotes - stats.totalDownvotes;

  return (
    <div className={cn("flex items-center gap-0", className)}>
      {/* Upvote */}
      <button
        type="button"
        onClick={handleVote("upvote")}
        className={cn(
          "font-sans transition-all duration-150 select-none rounded-l-md border",
          isLg ? "text-sm px-3 py-2" : "text-[11px] px-2 py-1.5",
          vote === "upvote"
            ? "bg-primary-500/15 border-primary-500/40 text-primary-400"
            : "bg-transparent border-white/[0.06] text-gray-600 hover:text-gray-400 hover:border-white/[0.12]"
        )}
        aria-label="Beğen"
      >
        &#9650;
      </button>

      {/* Skor göstergesi — artık toplam skor */}
      <span
        className={cn(
          "font-sans tabular-nums border-y border-white/[0.06] flex items-center justify-center select-none",
          isLg ? "text-xs px-3 py-2 min-w-[2.5rem]" : "text-[10px] px-2 py-1.5 min-w-[1.75rem]",
          netScore > 0 ? "text-primary-400" : netScore < 0 ? "text-red-400" : "text-gray-700"
        )}
      >
        {netScore > 0 ? `+${netScore}` : netScore}
      </span>

      {/* Downvote */}
      <button
        type="button"
        onClick={handleVote("downvote")}
        className={cn(
          "font-sans transition-all duration-150 select-none rounded-r-md border border-l-0",
          isLg ? "text-sm px-3 py-2" : "text-[11px] px-2 py-1.5",
          vote === "downvote"
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-transparent border-white/[0.06] text-gray-600 hover:text-gray-400 hover:border-white/[0.12]"
        )}
        aria-label="Beğenme"
      >
        &#9660;
      </button>
    </div>
  );
}
