"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — CommentPreview
// Feed kartlarındaki yorum özeti — sadece root yorumlar.
// Hafif render: oy/yanıt/silme yok, sadece username + text + zaman.
// ─────────────────────────────────────────────────────────────

import type { Comment } from "@/lib/comments";
import { timeAgo } from "@/lib/utils";

type CommentPreviewProps = {
  rootComments: Comment[];
  previewCount: number;
  loading: boolean;
};

export function CommentPreview({
  rootComments,
  previewCount,
  loading,
}: CommentPreviewProps) {
  if (loading) {
    return (
      <div className="space-y-2 pt-2 animate-pulse">
        <div className="rounded-lg bg-white/[0.03] h-12" />
      </div>
    );
  }

  if (rootComments.length === 0) return null;

  const displayComments = rootComments.slice(0, previewCount);
  const hasMore = rootComments.length > previewCount;

  return (
    <div className="space-y-2 pt-2">
      {displayComments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg border border-white/[0.06] bg-surface-1/50 px-3 py-2 space-y-1.5"
        >
          {comment.username && (
            <span className="text-[10px] font-semibold text-primary-400/70">
              {comment.username}
            </span>
          )}
          {comment.text && (
            <p className="text-xs font-sans text-gray-400 leading-relaxed line-clamp-2">
              {comment.text}
            </p>
          )}
          <span className="text-[9px] text-gray-500 block">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
      ))}
      {hasMore && (
        <p className="text-[10px] text-gray-500">
          +{rootComments.length - previewCount} görüş daha
        </p>
      )}
    </div>
  );
}
