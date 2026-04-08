"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — useSignal Hook
// Optimistic localStorage + Supabase sync.
// Giriş yapmamış: localStorage only.
// Giriş yapmış: localStorage + Supabase arka plan sync.
// initialStats: FeedContainer tarafından batch olarak önceden
//   çekilen istatistikler geçilebilir — ayrıca fetch yapılmaz.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getSignal,
  toggleOwnership,
  toggleVote,
  syncSignalToSupabase,
  fetchUserSignal,
  writeSignal,
  type Signal,
  type VoteType,
  type ArticleStats,
} from "@/lib/signals";
import { fetchStats } from "@/lib/signal-batch";
import { useAuth } from "@/components/auth/auth-provider";

const EMPTY_STATS: ArticleStats = {
  totalOwners: 0,
  totalUpvotes: 0,
  totalDownvotes: 0,
  totalComments: 0,
};

export function useSignal(articleId: string, initialStats?: ArticleStats) {
  const { user } = useAuth();
  const [signal, setSignal] = useState<Signal>(() => getSignal(articleId));
  const [stats, setStats] = useState<ArticleStats>(initialStats ?? EMPTY_STATS);
  const [statsLoaded, setStatsLoaded] = useState(Boolean(initialStats));

  // articleId değişince localStorage'dan sinyali güncelle (render-time)
  const [prevArticleId, setPrevArticleId] = useState(articleId);
  if (articleId !== prevArticleId) {
    setPrevArticleId(articleId);
    setSignal(getSignal(articleId));
    setStats(initialStats ?? EMPTY_STATS);
    setStatsLoaded(Boolean(initialStats));
  }

  // initialStats prop değişince (FeedContainer'dan yeni batch gelince) güncelle
  const [prevInitialStats, setPrevInitialStats] = useState(initialStats);
  if (initialStats !== prevInitialStats) {
    setPrevInitialStats(initialStats);
    if (initialStats) {
      setStats(initialStats);
      setStatsLoaded(true);
    }
  }

  // Sayfa yüklenince: Supabase'den kullanıcı sinyali + istatistikleri al
  // initialStats sağlanmışsa stats fetch atlanır (FeedContainer zaten yaptı).
  useEffect(() => {
    if (!initialStats) {
      // Detay sayfaları veya batch dışı kullanım — tek-article fetch
      fetchStats(articleId).then((s) => {
        setStats(s);
        setStatsLoaded(true);
      }).catch((_err: unknown) => {
        console.error("[useSignal]", _err);
        setStatsLoaded(true);
      });
    }

    // Giriş yapmışsa kendi sinyalini de Supabase'den al
    if (user) {
      fetchUserSignal(articleId).then((remote) => {
        if (remote) {
          setSignal(remote);
          writeSignal(articleId, remote);
        }
      }).catch((_err: unknown) => {
        console.error("[useSignal]", _err);
      });
    }
   
  // initialStats değişimi render-time'da prevInitialStats pattern ile yakalanır
  // — effect'e eklenmesi user signal fetch'in gereksiz tekrarına neden olur.
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
      syncSignalToSupabase(articleId, result).catch((_err: unknown) => {
        console.error("[useSignal]", _err);
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
        syncSignalToSupabase(articleId, result).catch((_err: unknown) => {
          console.error("[useSignal]", _err);
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
