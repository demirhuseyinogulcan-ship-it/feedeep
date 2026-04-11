"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — CommentSection (Orchestrator)
// Tek sorumluluk: mod yönlendirme + hook bağlantısı.
// İç bileşenler SRP ile ayrılmış:
//   CommentForm     → form submission UI
//   CommentItem     → tek yorum render (React.memo)
//   CommentActions  → oy/yanıt/sil butonları (React.memo)
//   CommentPreview  → feed kartı özeti
//   useCommentActions → voting/delete/reply logic
// ─────────────────────────────────────────────────────────────

import { useComments } from "@/hooks/use-comments";
import { useCommentActions } from "@/hooks/use-comment-actions";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { CommentPreview } from "./comment-preview";

type Props = {
  articleId: string;
  /** Feed kartlarında sadece özet göster */
  preview?: boolean;
  /** Önizleme modunda gösterilecek max yorum sayısı */
  previewCount?: number;
};

export function CommentSection({
  articleId,
  preview = false,
  previewCount = 3,
}: Props) {
  const {
    rootComments,
    loading,
    getReplies,
    addComment,
    removeComment,
    voteComment,
  } = useComments(articleId);

  const {
    currentUserId,
    requestAuth,
    handleVote,
    handleDelete,
    handleReply,
    handleNewComment,
    submitError,
    clearSubmitError,
  } = useCommentActions({ voteComment, removeComment, addComment });

  // ── Preview modu — feed kartlarında ──
  if (preview) {
    return (
      <CommentPreview
        rootComments={rootComments}
        previewCount={previewCount}
        loading={loading}
      />
    );
  }

  // ── Tam görünüm — detay sayfası ──
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <span className="text-[10px] tracking-widest uppercase text-gray-500 block">
        Gorusler
      </span>

      {/* Yeni yorum formu */}
      {currentUserId ? (
        <CommentForm
          onSubmit={handleNewComment}
          error={submitError ?? undefined}
          onErrorClear={clearSubmitError}
        />
      ) : (
        <button
          onClick={requestAuth}
          className="w-full text-center text-[11px] font-heading tracking-widest uppercase py-3 rounded-lg border border-white/[0.06] text-gray-500 hover:text-primary-400 hover:border-primary-500/30 transition-colors"
        >
          Gorus yazmak icin giris yap
        </button>
      )}

      {/* Yükleniyor skeleton */}
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
              depth={0}
              currentUserId={currentUserId}
              getReplies={getReplies}
              onVote={handleVote}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
