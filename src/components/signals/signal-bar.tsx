"use client";

// ─────────────────────────────────────────────────────────────
// AI Rehber — Signal Bar (Sahip Ol + Beğen/Beğenme)
// Feed kartları ve detay sayfaları için birleşik sinyal çubuğu.
// useSignal tek burada çağrılır — OwnButton ve VoteButtons paylaşır.
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

export function SignalBar({ articleId, size = "sm", className }: Props) {
  const { signal, stats, toggleOwn, toggleVote } = useSignal(articleId);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <VoteButtons signal={signal} stats={stats} toggleVote={toggleVote} size={size} />
      <OwnButton signal={signal} stats={stats} toggleOwn={toggleOwn} size={size} />
    </div>
  );
}
