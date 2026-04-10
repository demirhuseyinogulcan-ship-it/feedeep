"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — useSignal Hook
// DataLoader batching: 50 kart → 3 Supabase isteği (sabit).
// Optimistic localStorage + Supabase sync.
// Giriş yapmamış: localStorage only.
// Giriş yapmış: localStorage + Supabase arka plan sync.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getSignal,
  toggleOwnership,
  toggleVote,
  writeSignal,
  syncSignalToSupabase,
  type Signal,
  type VoteType,
  type ArticleStats,
} from "@/lib/signals";
import { signalBatcher } from "@/lib/signal-batch";
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
  const [statsLoaded, setStatsLoaded] = useState(!!initialStats);

  // articleId değişince localStorage'dan sinyali güncelle (render-time)
  const [prevArticleId, setPrevArticleId] = useState(articleId);
  if (articleId !== prevArticleId) {
    setPrevArticleId(articleId);
    setSignal(getSignal(articleId));
    setStats(initialStats ?? EMPTY_STATS);
    setStatsLoaded(!!initialStats);
  }

  // Sayfa yüklenince: DataLoader üzerinden toplu istek
  useEffect(() => {
    let cancelled = false;

    // İstatistikler her zaman fetch edilir — anonim kullanıcı da sayıları görür
    signalBatcher.requestStats(articleId).then((s) => {
      if (!cancelled) {
        setStats(s);
        setStatsLoaded(true);
      }
    }).catch((err) => {
      console.error("[useSignal] Stats fetch hatası:", err);
      if (!cancelled) setStatsLoaded(true);
    });

    if (user) {
      // Giriş yapmışsa kendi sinyalini de batch ile al — LWW karşılaştırması
      signalBatcher.requestUserSignal(articleId).then((remote) => {
        if (cancelled) return;
        if (remote) {
          const local = getSignal(articleId);
          const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
          const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;

          if (remoteTime >= localTime) {
            // Remote daha yeni veya eşit — local'i güncelle
            setSignal(remote);
            writeSignal(articleId, remote);
          } else {
            // Local daha yeni — remote'u güncelle
            syncSignalToSupabase(articleId, local).catch((err) => {
              console.error("[useSignal] LWW push hatası:", err);
            });
          }
        }
      }).catch((err) => {
        console.error("[useSignal] User signal fetch hatası:", err);
      });
    }

    return () => { cancelled = true; };
  }, [articleId, user]);

  // Anonim / çıkış yapmış kullanıcı: localStorage'dan gelen owned/vote gösterilmemeli.
  // Derive edilmiş değer — setState çağrılmaz, yeniden render tetiklenmez.
  const displaySignal = user ? signal : { ...signal, owned: false, vote: null as typeof signal.vote };

  const handleToggleOwn = useCallback(() => {
    const result = toggleOwnership(articleId);
    setSignal({ ...result });

    // Optimistic stats güncelle
    setStats((prev) => ({
      ...prev,
      totalOwners: prev.totalOwners + (result.owned ? 1 : -1),
    }));

    // Cache invalidate — sonraki sayfa gezintisinde taze veri gelsin
    signalBatcher.invalidateStats(articleId);
    signalBatcher.invalidateUserSignal(articleId);

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

      // Cache invalidate — sonraki sayfa gezintisinde taze veri gelsin
      signalBatcher.invalidateStats(articleId);
      signalBatcher.invalidateUserSignal(articleId);

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
    signal: displaySignal,
    stats,
    statsLoaded,
    toggleOwn: handleToggleOwn,
    toggleVote: handleToggleVote,
  };
}
