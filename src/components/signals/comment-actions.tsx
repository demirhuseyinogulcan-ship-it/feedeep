"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — CommentActions
// Yorum alt barı: zaman + oylama + yanıtla + sil.
// Tek sorumluluk: buton render — logic useCommentActions'da.
// ─────────────────────────────────────────────────────────────

import { memo } from "react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";

type CommentActionsProps = {
  commentId: string;
  createdAt: string;
  vote: "up" | "down" | null;
  score: number;
  canReply: boolean;
  canDelete: boolean;
  showReplyForm: boolean;
  onVote: (type: "up" | "down") => void;
  onToggleReply: () => void;
  onDelete: () => void;
};

export const CommentActions = memo(function CommentActions({
  createdAt,
  vote,
  score,
  canReply,
  canDelete,
  showReplyForm,
  onVote,
  onToggleReply,
  onDelete,
}: CommentActionsProps) {
  return (
    <div className="flex items-center gap-3 text-[11px]">
      <span className="text-gray-500">{timeAgo(createdAt)}</span>

      {/* Oy butonları */}
      <button
        onClick={() => onVote("up")}
        className={cn(
          "transition-colors",
          vote === "up"
            ? "text-primary-400"
            : "text-gray-500 hover:text-gray-300",
        )}
      >
        &#9650;
      </button>
      <span
        className={cn(
          "tabular-nums min-w-[1rem] text-center",
          vote === "up"
            ? "text-primary-400"
            : vote === "down"
              ? "text-red-400"
              : "text-gray-500",
        )}
      >
        {score}
      </span>
      <button
        onClick={() => onVote("down")}
        className={cn(
          "transition-colors",
          vote === "down"
            ? "text-red-400"
            : "text-gray-500 hover:text-gray-300",
        )}
      >
        &#9660;
      </button>

      {/* Yanıtla */}
      {canReply && (
        <button
          onClick={onToggleReply}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showReplyForm ? "iptal" : "yanıtla"}
        </button>
      )}

      {/* Sil */}
      {canDelete && (
        <button
          onClick={onDelete}
          className="text-gray-600 hover:text-red-400 transition-colors"
        >
          sil
        </button>
      )}
    </div>
  );
});
