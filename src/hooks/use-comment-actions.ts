"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — useCommentActions Hook
// Oylama, silme ve yanıtlama logic'ini UI bileşenlerinden ayırır.
// UI sadece render eder, hook sadece veri işler.
// ─────────────────────────────────────────────────────────────

import { useCallback, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type UseCommentActionsParams = {
  voteComment: (commentId: string, type: "up" | "down") => void;
  removeComment: (commentId: string) => void;
  addComment: (text: string, parentId?: string) => Promise<void>;
};

export function useCommentActions({
  voteComment,
  removeComment,
  addComment,
}: UseCommentActionsParams) {
  const { user, requestAuth } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Oy ver — giriş yoksa auth iste */
  const handleVote = useCallback(
    (commentId: string, type: "up" | "down") => {
      if (!user) {
        requestAuth();
        return;
      }
      voteComment(commentId, type);
    },
    [user, requestAuth, voteComment],
  );

  /** Sil — sadece kendi yorumu */
  const handleDelete = useCallback(
    (commentId: string) => {
      removeComment(commentId);
    },
    [removeComment],
  );

  /** Yanıtla — giriş yoksa auth iste */
  const handleReply = useCallback(
    async (text: string, parentId: string) => {
      if (!user) {
        requestAuth();
        return;
      }
      setSubmitError(null);
      try {
        await addComment(text, parentId);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Bir hata oluştu.");
      }
    },
    [user, requestAuth, addComment],
  );

  /** Yeni root yorum */
  const handleNewComment = useCallback(
    async (text: string) => {
      setSubmitError(null);
      try {
        await addComment(text);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Bir hata oluştu.");
      }
    },
    [addComment],
  );

  return {
    currentUserId: user?.id,
    requestAuth,
    handleVote,
    handleDelete,
    handleReply,
    handleNewComment,
    submitError,
    clearSubmitError: () => setSubmitError(null),
  };
}
