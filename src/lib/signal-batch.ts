// ─────────────────────────────────────────────────────────────
// feedeep — Signal DataLoader (Request Batching + Deduplication)
//
// Problem : N tane <SignalBar> → N×2 Supabase isteği (N+1 problem)
// Çözüm  : DataLoader pattern — queueMicrotask ile aynı render
//           tick'teki tüm articleId'leri topla, tek toplu sorgu at.
//
// 50 kart → 100 istek ÖNCE
// 50 kart → 3 istek  SONRA (signals + comments + user signals)
//
// In-memory TTL cache: aynı sayfa içinde tekrar fetch yok.
// ─────────────────────────────────────────────────────────────

import {
  getSupabase,
  isSupabaseConfigured,
  getSessionUserId,
} from "./supabase";
import type { Signal, VoteType, ArticleStats } from "./signals";

// ─── Cache Config ───────────────────────────────────────────

const STATS_TTL = 30_000; // 30 saniye — istatistikler sık değişir
const USER_SIGNAL_TTL = 60_000; // 60 saniye — kullanıcı aksiyonu daha stabil

type CacheEntry<T> = { data: T; expiry: number };

// ─── Batch Callback ────────────────────────────────────────

type BatchCallback<T> = {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
};

// ─── Empty Stats (sentinel) ────────────────────────────────

const EMPTY_STATS: ArticleStats = {
  totalOwners: 0,
  totalUpvotes: 0,
  totalDownvotes: 0,
  totalComments: 0,
};

// ─── DataLoader Singleton ──────────────────────────────────

class SignalBatcher {
  // ── Pending request queues ──
  private pendingStats = new Map<string, BatchCallback<ArticleStats>[]>();
  private pendingUserSignals = new Map<string, BatchCallback<Signal | null>[]>();
  private statsScheduled = false;
  private userSignalsScheduled = false;

  // ── In-memory cache ──
  private statsCache = new Map<string, CacheEntry<ArticleStats>>();
  private userSignalCache = new Map<string, CacheEntry<Signal | null>>();

  // ─── Public API ──────────────────────────────────────────

  /**
   * Makale istatistiklerini iste.
   * Aynı microtask tick'teki tüm istekler tek sorguda birleştirilir.
   */
  requestStats(articleId: string): Promise<ArticleStats> {
    // Cache hit → anında dön
    const cached = this.statsCache.get(articleId);
    if (cached && cached.expiry > Date.now()) {
      return Promise.resolve(cached.data);
    }

    return new Promise<ArticleStats>((resolve, reject) => {
      const queue = this.pendingStats.get(articleId);
      if (queue) {
        queue.push({ resolve, reject });
      } else {
        this.pendingStats.set(articleId, [{ resolve, reject }]);
      }
      this.scheduleStatsFlush();
    });
  }

  /**
   * Kullanıcının kendi signal verisini iste.
   * Aynı microtask tick'teki tüm istekler tek sorguda birleştirilir.
   */
  requestUserSignal(articleId: string): Promise<Signal | null> {
    const cached = this.userSignalCache.get(articleId);
    if (cached && cached.expiry > Date.now()) {
      return Promise.resolve(cached.data);
    }

    return new Promise<Signal | null>((resolve, reject) => {
      const queue = this.pendingUserSignals.get(articleId);
      if (queue) {
        queue.push({ resolve, reject });
      } else {
        this.pendingUserSignals.set(articleId, [{ resolve, reject }]);
      }
      this.scheduleUserSignalsFlush();
    });
  }

  /**
   * Belirli bir makalenin stats cache'ini invalidate et.
   * toggleOwn / toggleVote sonrası çağrılır.
   */
  invalidateStats(articleId: string): void {
    this.statsCache.delete(articleId);
  }

  /**
   * Belirli bir makalenin user signal cache'ini invalidate et.
   */
  invalidateUserSignal(articleId: string): void {
    this.userSignalCache.delete(articleId);
  }

  // ─── Scheduling ──────────────────────────────────────────

  private scheduleStatsFlush(): void {
    if (this.statsScheduled) return;
    this.statsScheduled = true;
    queueMicrotask(() => this.flushStats());
  }

  private scheduleUserSignalsFlush(): void {
    if (this.userSignalsScheduled) return;
    this.userSignalsScheduled = true;
    queueMicrotask(() => this.flushUserSignals());
  }

  // ─── Batch Execution — Stats ─────────────────────────────

  private async flushStats(): Promise<void> {
    this.statsScheduled = false;
    const batch = new Map(this.pendingStats);
    this.pendingStats.clear();

    const articleIds = [...batch.keys()];

    try {
      const results = await batchFetchStats(articleIds);

      for (const [id, callbacks] of batch) {
        const stats = results.get(id) ?? EMPTY_STATS;
        this.statsCache.set(id, {
          data: stats,
          expiry: Date.now() + STATS_TTL,
        });
        for (const cb of callbacks) cb.resolve(stats);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      for (const callbacks of batch.values()) {
        for (const cb of callbacks) cb.reject(error);
      }
    }
  }

  // ─── Batch Execution — User Signals ──────────────────────

  private async flushUserSignals(): Promise<void> {
    this.userSignalsScheduled = false;
    const batch = new Map(this.pendingUserSignals);
    this.pendingUserSignals.clear();

    const articleIds = [...batch.keys()];

    try {
      const results = await batchFetchUserSignals(articleIds);

      for (const [id, callbacks] of batch) {
        const signal = results.get(id) ?? null;
        this.userSignalCache.set(id, {
          data: signal,
          expiry: Date.now() + USER_SIGNAL_TTL,
        });
        for (const cb of callbacks) cb.resolve(signal);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      for (const callbacks of batch.values()) {
        for (const cb of callbacks) cb.reject(error);
      }
    }
  }
}

// ─── Batch Fetch: Article Stats ────────────────────────────
// get_batch_article_stats(article_ids) → tek RPC, server-side GROUP BY.
// Client'a satır bazında veri gönderilmez; sadece toplamlar döner.
// 50 kart = 1 RPC çağrısı (önceki: 2 × tüm-satır sorguları)

async function batchFetchStats(
  articleIds: string[],
): Promise<Map<string, ArticleStats>> {
  const result = new Map<string, ArticleStats>();
  if (!isSupabaseConfigured() || articleIds.length === 0) return result;

  const sb = getSupabase();

  const { data, error } = await sb.rpc("get_batch_article_stats", {
    article_ids: articleIds,
  });

  if (error || !data) return result;

  for (const row of data) {
    result.set(row.article_id, {
      totalOwners: row.total_owners ?? 0,
      totalUpvotes: row.total_upvotes ?? 0,
      totalDownvotes: row.total_downvotes ?? 0,
      totalComments: row.total_comments ?? 0,
    });
  }

  return result;
}

// ─── Batch Fetch: User Signals ─────────────────────────────
// Tek sorgu: .in("article_id", ids) — 50 makale = 1 sorgu

async function batchFetchUserSignals(
  articleIds: string[],
): Promise<Map<string, Signal>> {
  const result = new Map<string, Signal>();
  if (!isSupabaseConfigured() || articleIds.length === 0) return result;

  const userId = await getSessionUserId();
  if (!userId) return result;

  const sb = getSupabase();

  const { data } = await sb
    .from("signals")
    .select("article_id, owned, vote, owned_at, voted_at")
    .eq("user_id", userId)
    .in("article_id", articleIds);

  if (data) {
    for (const row of data) {
      result.set(row.article_id as string, {
        owned: row.owned as boolean,
        vote: row.vote as VoteType | null,
        ownedAt: (row.owned_at as string) ?? undefined,
        votedAt: (row.voted_at as string) ?? undefined,
      });
    }
  }

  return result;
}

// ─── Singleton Export ──────────────────────────────────────

export const signalBatcher = new SignalBatcher();
