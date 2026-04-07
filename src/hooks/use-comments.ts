"use client";

// ─────────────────────────────────────────────────────────────
// AI Rehber — useComments Hook
// Optimistic localStorage + Supabase sync.
// Giriş yapmamış: localStorage only.
// Giriş yapmış: Supabase as source of truth.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import {
  addComment as addLocal,
  getReplies as getLocalReplies,
  deleteComment as deleteLocal,
  voteComment as voteLocal,
  fetchCommentsFromSupabase,
  addCommentToSupabase,
  deleteCommentFromSupabase,
  voteCommentOnSupabase,
  type Comment,
} from "@/lib/comments";
import { toggleOwnership, getSignal, syncSignalToSupabase } from "@/lib/signals";
import { useAuth } from "@/components/auth/auth-provider";

export function useComments(articleId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const isSupabase = useRef(false);
  const [loading, setLoading] = useState(true);

  // articleId/user değişince localStorage'dan yükle (render-time)
  const depsKey = `${articleId}-${user?.id ?? ""}`;
  const [prevDeps, setPrevDeps] = useState(depsKey);
  if (depsKey !== prevDeps) {
    setPrevDeps(depsKey);
    setLoading(true);
    const store = JSON.parse(localStorage.getItem("airehber_comments") ?? "{}");
    const all: Comment[] = store[articleId] ?? [];
    setComments([...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  // Yorumları yükle (manuel refresh + Supabase fetch)
  const refresh = useCallback(async () => {
    if (user) {
      try {
        const remote = await fetchCommentsFromSupabase(articleId);
        if (remote.length > 0 || isSupabase.current) {
          isSupabase.current = true;
          setComments(remote);
          return;
        }
      } catch (err) {
        console.error("[useComments] Supabase fetch hatası:", err);
      }
    }
    // Fallback: localStorage — tüm yorumları al (nested dahil)
    const store = JSON.parse(localStorage.getItem("airehber_comments") ?? "{}");
    const all: Comment[] = store[articleId] ?? [];
    setComments([...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [articleId, user]);

  // Supabase'den ilk yükleme (async — effect'te güvenli)
  // Herkes (anonim dahil) Supabase yorumlarını görebilir (RLS: SELECT true)
  useEffect(() => {
    isSupabase.current = false;
    fetchCommentsFromSupabase(articleId).then((remote) => {
      if (remote.length > 0) {
        isSupabase.current = true;
        setComments(remote);
      }
    }).catch((err) => {
      console.error("[useComments] Supabase fetch hatası:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [articleId, user]);

  // Root yorumları filtrele
  const rootComments = comments.filter((c) => !c.parentId);

  // Replies — Supabase modunda comments listesinden filtrele
  const getReplies = useCallback(
    (parentId: string): Comment[] => {
      if (isSupabase.current) {
        return comments
          .filter((c) => c.parentId === parentId)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
      }
      return getLocalReplies(articleId, parentId);
    },
    [articleId, comments],
  );

  // Yorum ekle
  const addComment = useCallback(
    async (text: string, parentId?: string) => {
      // Otomatik sahiplenme
      const signal = getSignal(articleId);
      if (!signal.owned) {
        toggleOwnership(articleId);
        if (user) {
          syncSignalToSupabase(articleId, { ...signal, owned: true, ownedAt: new Date().toISOString() }).catch(() => {});
        }
      }

      if (user) {
        // Supabase'e ekle
        const result = await addCommentToSupabase(articleId, text, undefined, parentId);
        if (result) {
          isSupabase.current = true;
          await refresh();
          return;
        }
      }

      // Fallback: localStorage
      addLocal(articleId, text, undefined, parentId);
      refresh();
    },
    [articleId, user, refresh],
  );

  // Yorum sil
  const removeComment = useCallback(
    async (commentId: string) => {
      if (user && isSupabase.current) {
        await deleteCommentFromSupabase(commentId);
        await refresh();
        return;
      }
      deleteLocal(articleId, commentId);
      refresh();
    },
    [articleId, user, refresh],
  );

  // Yorum oyla
  const voteComment = useCallback(
    async (commentId: string, type: "up" | "down") => {
      // Optimistic: güncelle local state
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const newVote = c.vote === type ? null : type;
          return { ...c, vote: newVote };
        }),
      );

      if (user && isSupabase.current) {
        const current = comments.find((c) => c.id === commentId);
        const newVote = current?.vote === type ? null : type;
        await voteCommentOnSupabase(commentId, newVote);
        return;
      }
      voteLocal(articleId, commentId, type);
    },
    [articleId, user, comments],
  );

  return {
    comments,
    rootComments,
    loading,
    getReplies,
    addComment,
    removeComment,
    voteComment,
    refresh,
  };
}
