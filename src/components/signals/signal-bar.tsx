"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Signal Bar (Sahip Ol + Begen/Begenme)
// Feed kartlari ve detay sayfalari icin birlesik sinyal cubugu.
// useSignal tek burada cagrilir — OwnButton ve VoteButtons paylas.
// ─────────────────────────────────────────────────────────────

import { OwnButton } from "@/components/signals/own-button";
import { VoteButtons } from "@/components/signals/vote-buttons";
import { useSignal } from "@/hooks/use-signal";
import { cn } from "@/lib/utils";

type Props = {
  articleId: string;
  size?: "sm" | "lg";
  className?: string;
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

export function SignalBar({ articleId, size = "sm", className }: Props) {
  const { signal, stats, statsLoaded, toggleOwn, toggleVote } = useSignal(articleId);

  if (!statsLoaded) {
    return (
      <div className={className}>
        <SignalBarSkeleton size={size} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <VoteButtons signal={signal} stats={stats} toggleVote={toggleVote} size={size} />
      <OwnButton signal={signal} stats={stats} toggleOwn={toggleOwn} size={size} />
    </div>
  );
}
