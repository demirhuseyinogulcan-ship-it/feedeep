"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Comment Section (Threaded)
// Reddit-style nested replies + oy.
// Supabase hybrid: authenticated → persistent, anonymous → localStorage.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useComments } from "@/hooks/use-comments";
import { useAuth } from "@/components/auth/auth-provider";
import type { Comment } from "@/lib/comments";
import { cn, timeAgo } from "@/lib/utils";

type Props = {
  articleId: string;
  /** Feed kartlarında sadece özet göster */
  preview?: boolean;
  /** Önizleme modunda gösterilecek max yorum sayısı */
  previewCount?: number;
};

// ─── Inline Comment Form ───

function CommentForm({
  onSubmit,
  placeholder = "Görüşünü yaz...",
  compact = false,
}: {
  onSubmit: (text: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={1000}
        className={cn(
          "w-full resize-none rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2 font-sans text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors",
          compact ? "text-xs" : "text-sm",
        )}
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-600 tabular-nums">
          {text.length}/1000
        </span>
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="text-[11px] font-heading font-semibold tracking-widest uppercase px-3 py-1.5 rounded-md border border-white/[0.08] text-gray-300 hover:text-gray-100 hover:border-primary-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Gönder
        </button>
      </div>
    </form>
  );
}

// ─── Single Comment (recursive for threading) ───

function CommentItem({
  comment,
  articleId,
  depth,
  onVote,
  onDelete,
  onReply,
  getReplies,
  currentUserId,
  requestAuth,
}: {
  comment: Comment;
  articleId: string;
  depth: number;
  onVote: (commentId: string, type: "up" | "down") => void;
  onDelete: (commentId: string) => void;
  onReply: (text: string, parentId?: string) => void;
  getReplies: (parentId: string) => Comment[];
  currentUserId?: string;
  requestAuth?: () => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [vote, setVote] = useState(comment.vote);
  const replies = getReplies(comment.id);
  const maxDepth = 3;

  function handleVote(type: "up" | "down") {
    if (!currentUserId) { requestAuth?.(); return; }
    onVote(comment.id, type);
    setVote((prev) => (prev === type ? null : type));
  }

  function handleReply(text: string) {
    if (!currentUserId) { requestAuth?.(); return; }
    onReply(text, comment.id);
    setShowReplyForm(false);
  }

  const score = vote === "up" ? 1 : vote === "down" ? -1 : 0;
  const canDelete = Boolean(currentUserId) && comment.userId === currentUserId;

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
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-500">
            {timeAgo(comment.createdAt)}
          </span>

          {/* Oy butonları */}
          <button
            onClick={() => handleVote("up")}
            className={cn(
              "transition-colors",
              vote === "up" ? "text-primary-400" : "text-gray-500 hover:text-gray-300",
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
            onClick={() => handleVote("down")}
            className={cn(
              "transition-colors",
              vote === "down" ? "text-red-400" : "text-gray-500 hover:text-gray-300",
            )}
          >
            &#9660;
          </button>

          {/* Yanıtla */}
          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              yanıtla
            </button>
          )}

          {/* Sil — sadece kendi yorumunu */}
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              sil
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="pt-2">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Yanıtını yaz..."
              compact
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="space-y-0">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              depth={depth + 1}
              onVote={onVote}
              onDelete={onDelete}
              onReply={onReply}
              getReplies={getReplies}
              currentUserId={currentUserId}
              requestAuth={requestAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ───

export function CommentSection({
  articleId,
  preview = false,
  previewCount = 3,
}: Props) {
  const { user, requestAuth } = useAuth();
  const {
    rootComments,
    loading,
    getReplies,
    addComment: hookAddComment,
    removeComment,
    voteComment,
  } = useComments(articleId);

  async function handleNewComment(text: string) {
    await hookAddComment(text);
  }

  async function handleReply(text: string, parentId?: string) {
    await hookAddComment(text, parentId);
  }

  const displayComments = preview
    ? rootComments.slice(0, previewCount)
    : rootComments;
  const hasMore = preview && rootComments.length > previewCount;

  // Onizleme modunda — feed kartlarinda
  if (preview) {
    if (loading) {
      return (
        <div className="space-y-2 pt-2 animate-pulse">
          <div className="rounded-lg bg-white/[0.03] h-12" />
        </div>
      );
    }

    if (rootComments.length === 0) return null;

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

  // Tam gorunum — detay sayfasi
  return (
    <div className="space-y-6">
      {/* Baslik */}
      <span className="text-[10px] tracking-widest uppercase text-gray-500 block">
        Gorusler
      </span>

      {/* Yeni yorum formu */}
      {user ? (
        <CommentForm onSubmit={handleNewComment} />
      ) : (
        <button
          onClick={requestAuth}
          className="w-full text-center text-[11px] font-heading tracking-widest uppercase py-3 rounded-lg border border-white/[0.06] text-gray-500 hover:text-primary-400 hover:border-primary-500/30 transition-colors"
        >
          Gorus yazmak icin giris yap
        </button>
      )}

      {/* Yukleniyor skeleton */}
      {loading && (
        <div className="space-y-3 pt-2 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2 py-2">
              <div className="h-3 w-20 rounded bg-white/[0.04]" />
              <div className="h-4 w-3/4 rounded bg-white/[0.03]" />
              <div className="h-3 w-32 rounded bg-white/[0.02]" />
            </div>
          ))}
        </div>
      )}

      {/* Threaded yorum listesi */}
      {!loading && rootComments.length > 0 && (
        <div className="space-y-1 pt-2">
          {rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              depth={0}
              onVote={voteComment}
              onDelete={removeComment}
              onReply={handleReply}
              getReplies={getReplies}
              currentUserId={user?.id}
              requestAuth={requestAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
