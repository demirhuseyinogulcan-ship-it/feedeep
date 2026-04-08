"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — useCommentActions Hook
// Oylama, silme ve yanıtlama logic'ini UI bileşenlerinden ayırır.
// UI sadece render eder, hook sadece veri işler.
// ─────────────────────────────────────────────────────────────

import { useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type UseCommentActionsParams = {
  voteComment: (commentId: string, type: "up" | "down") => void;
  removeComment: (commentId: string) => void;
  addComment: (text: string, parentId?: string) => void;
};

export function useCommentActions({
  voteComment,
  removeComment,
  addComment,
}: UseCommentActionsParams) {
  const { user, requestAuth } = useAuth();

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
    (text: string, parentId: string) => {
      if (!user) {
        requestAuth();
        return;
      }
      addComment(text, parentId);
    },
    [user, requestAuth, addComment],
  );

  /** Yeni root yorum */
  const handleNewComment = useCallback(
    (text: string) => {
      addComment(text);
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
  };
}
