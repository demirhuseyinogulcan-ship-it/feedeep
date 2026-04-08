"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — CommentItem (React.memo)
// Tek yorum render — cascade re-render korumalı.
// Deep thread'lerde parent yorum update edildiğinde
// kardeş ve alt thread'ler gereksiz render olmaz.
// ─────────────────────────────────────────────────────────────

import { memo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/comments";
import { CommentActions } from "./comment-actions";
import { CommentForm } from "./comment-form";

const MAX_DEPTH = 3;

type CommentItemProps = {
  comment: Comment;
  depth: number;
  currentUserId?: string;
  getReplies: (parentId: string) => Comment[];
  onVote: (commentId: string, type: "up" | "down") => void;
  onDelete: (commentId: string) => void;
  onReply: (text: string, parentId: string) => void;
};

export const CommentItem = memo(function CommentItem({
  comment,
  depth,
  currentUserId,
  getReplies,
  onVote,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const replies = getReplies(comment.id);

  const score =
    comment.vote === "up" ? 1 : comment.vote === "down" ? -1 : 0;
  const canDelete =
    Boolean(currentUserId) && comment.userId === currentUserId;
  const canReply = depth < MAX_DEPTH;

  // ── Callback'ler: stable referans, gereksiz re-render önleme ──

  const handleVote = useCallback(
    (type: "up" | "down") => onVote(comment.id, type),
    [onVote, comment.id],
  );

  const handleDelete = useCallback(
    () => onDelete(comment.id),
    [onDelete, comment.id],
  );

  const handleToggleReply = useCallback(
    () => setShowReplyForm((prev) => !prev),
    [],
  );

  const handleReplySubmit = useCallback(
    (text: string) => {
      onReply(text, comment.id);
      setShowReplyForm(false);
    },
    [onReply, comment.id],
  );

  return (
    <div className={cn(depth > 0 && "ml-4 pl-3 border-l border-white/[0.08]")}>
      <div className="py-2 space-y-1.5">
        {/* Kullanıcı adı */}
        {comment.username && (
          <span className="text-[11px] font-semibold text-primary-400/80">
            {comment.username}
          </span>
        )}

        {/* Metin */}
        {comment.text && (
          <p className="text-sm font-sans text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
            {comment.text}
          </p>
        )}

        {/* Alt bar: zaman + oy + yanıtla + sil */}
        <CommentActions
          commentId={comment.id}
          createdAt={comment.createdAt}
          vote={comment.vote}
          score={score}
          canReply={canReply}
          canDelete={canDelete}
          showReplyForm={showReplyForm}
          onVote={handleVote}
          onToggleReply={handleToggleReply}
          onDelete={handleDelete}
        />

        {/* Reply form */}
        {showReplyForm && (
          <div className="pt-2">
            <CommentForm
              onSubmit={handleReplySubmit}
              placeholder="Yanıtını yaz..."
              compact
            />
          </div>
        )}
      </div>

      {/* Nested replies — recursive */}
      {replies.length > 0 && (
        <div className="space-y-0">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              getReplies={getReplies}
              onVote={onVote}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
});
