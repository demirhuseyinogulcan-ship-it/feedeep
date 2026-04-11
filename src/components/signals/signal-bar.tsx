"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Signal Bar (Sahip Ol + Begen/Begenme)
// Feed kartlari ve detay sayfalari icin birlesik sinyal cubugu.
// useSignal tek burada cagrilir — OwnButton ve VoteButtons paylas.
// ─────────────────────────────────────────────────────────────

import { OwnButton } from "@/components/signals/own-button";
import { VoteButtons } from "@/components/signals/vote-buttons";
import { useSignal } from "@/hooks/use-signal";
import { cn, formatViews } from "@/lib/utils";
import { Eye } from "lucide-react";
import type { ArticleStats } from "@/lib/signals";

type Props = {
  articleId: string;
  size?: "sm" | "lg";
  className?: string;
  /** FeedContainer'dan batch olarak önceden çekilen istatistikler.
   *  Sağlanırsa useSignal hook'u ayrıca fetch yapmaz. */
  initialStats?: ArticleStats;
};

function SignalBarSkeleton({ size = "sm" }: { size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <div className="flex items-center justify-between animate-pulse">
      {/* Vote skeleton */}
      <div className="flex items-center gap-0">
        <div className={cn("rounded-l-md bg-white/[0.04]", isLg ? "w-10 h-9" : "w-7 h-7")} />
        <div className={cn("bg-white/[0.04]", isLg ? "w-10 h-9" : "w-7 h-7")} />
        <div className={cn("rounded-r-md bg-white/[0.04]", isLg ? "w-10 h-9" : "w-7 h-7")} />
      </div>
      {/* Own button skeleton */}
      <div className={cn("rounded-md bg-white/[0.04]", isLg ? "w-28 h-9" : "w-24 h-7")} />
    </div>
  );
}

export function SignalBar({ articleId, size = "sm", className, initialStats }: Props) {
  const { signal, stats, statsLoaded, toggleOwn, toggleVote } = useSignal(articleId, initialStats);

  if (!statsLoaded) {
    return (
      <div className={className}>
        <SignalBarSkeleton size={size} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <VoteButtons signal={signal} stats={stats} toggleVote={toggleVote} size={size} />
        {stats.totalViews >= 100 && (
          <span className={cn(
            "flex items-center gap-1 text-gray-600 tabular-nums",
            size === "lg" ? "text-xs" : "text-[10px]",
          )}>
            <Eye className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} />
            {formatViews(stats.totalViews)}
          </span>
        )}
      </div>
      <OwnButton signal={signal} stats={stats} toggleOwn={toggleOwn} size={size} />
    </div>
  );
}
