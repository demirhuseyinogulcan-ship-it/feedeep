"use client";

// ─────────────────────────────────────────────────────────────
// AI Rehber — useSignal Hook
// Optimistic localStorage + Supabase sync.
// Giriş yapmamış: localStorage only.
// Giriş yapmış: localStorage + Supabase arka plan sync.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getSignal,
  toggleOwnership,
  toggleVote,
  syncSignalToSupabase,
  fetchUserSignal,
  fetchArticleStats,
  type Signal,
  type VoteType,
  type ArticleStats,
} from "@/lib/signals";
import { useAuth } from "@/components/auth/auth-provider";

const EMPTY_STATS: ArticleStats = {
  totalOwners: 0,
  totalUpvotes: 0,
  totalDownvotes: 0,
  totalComments: 0,
};

export function useSignal(articleId: string) {
  const { user } = useAuth();
  const [signal, setSignal] = useState<Signal>(() => getSignal(articleId));
  const [stats, setStats] = useState<ArticleStats>(EMPTY_STATS);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // articleId değişince localStorage'dan sinyali güncelle (render-time)
  const [prevArticleId, setPrevArticleId] = useState(articleId);
  if (articleId !== prevArticleId) {
    setPrevArticleId(articleId);
    setSignal(getSignal(articleId));
    setStats(EMPTY_STATS);
    setStatsLoaded(false);
  }

  // Sayfa yüklenince: Supabase'den kullanıcı sinyali + istatistikleri al
  useEffect(() => {

    // Supabase'den istatistikleri al (herkes için)
    fetchArticleStats(articleId).then((s) => {
      setStats(s);
      setStatsLoaded(true);
    }).catch((err) => {
      console.error("[useSignal] Stats fetch hatası:", err);
      setStatsLoaded(true);
    });

    // Giriş yapmışsa kendi sinyalini de Supabase'den al
    if (user) {
      fetchUserSignal(articleId).then((remote) => {
        if (remote) {
          setSignal(remote);
          // localStorage'ı da güncelle
          const store = JSON.parse(localStorage.getItem("airehber_signals") ?? "{}");
          store[articleId] = remote;
          localStorage.setItem("airehber_signals", JSON.stringify(store));
        }
      }).catch((err) => {
        console.error("[useSignal] User signal fetch hatası:", err);
      });
    }
  }, [articleId, user]);

  const handleToggleOwn = useCallback(() => {
    const result = toggleOwnership(articleId);
    setSignal({ ...result });

    // Optimistic stats güncelle
    setStats((prev) => ({
      ...prev,
      totalOwners: prev.totalOwners + (result.owned ? 1 : -1),
    }));

    // Arka planda Supabase'e sync
    if (user) {
      syncSignalToSupabase(articleId, result).catch((err) => {
        console.error("[useSignal] Own sync hatası:", err);
      });
    }
  }, [articleId, user]);

  const handleToggleVote = useCallback(
    (type: VoteType) => {
      const prev = getSignal(articleId);
      const result = toggleVote(articleId, type);
      setSignal({ ...result });

      // Optimistic stats güncelle
      setStats((s) => {
        let { totalUpvotes, totalDownvotes } = s;

        // Eski oyu geri al
        if (prev.vote === "upvote") totalUpvotes--;
        if (prev.vote === "downvote") totalDownvotes--;

        // Yeni oyu ekle
        if (result.vote === "upvote") totalUpvotes++;
        if (result.vote === "downvote") totalDownvotes++;

        return { ...s, totalUpvotes, totalDownvotes };
      });

      // Arka planda Supabase'e sync
      if (user) {
        syncSignalToSupabase(articleId, result).catch((err) => {
          console.error("[useSignal] Vote sync hatası:", err);
        });
      }
    },
    [articleId, user],
  );

  return {
    signal,
    stats,
    statsLoaded,
    toggleOwn: handleToggleOwn,
    toggleVote: handleToggleVote,
  };
}
