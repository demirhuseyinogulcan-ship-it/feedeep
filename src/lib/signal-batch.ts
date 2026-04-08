// ─────────────────────────────────────────────────────────────
// feedeep — Signal Batch Fetch
// Birden fazla makale için istatistikleri tek RPC çağrısıyla getirir.
// get_batch_article_stats SQL fonksiyonu server-side GROUP BY yapar —
// tüm kart sayısı kaç olursa olsun tek bir Supabase çağrısı.
// ─────────────────────────────────────────────────────────────

import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { ArticleStats } from "./signals";

const EMPTY_STATS: ArticleStats = {
  totalOwners: 0,
  totalUpvotes: 0,
  totalDownvotes: 0,
  totalComments: 0,
};

type BatchRow = {
  article_id: string;
  total_owners: number;
  total_upvotes: number;
  total_downvotes: number;
  total_comments: number;
};

/**
 * Birden fazla makale için istatistikleri tek RPC çağrısıyla getirir.
 * Sonuç: Map<articleId, ArticleStats>
 *
 * Supabase tarafında çalışan SQL:
 *   get_batch_article_stats(article_ids TEXT[])
 *   — server-side GROUP BY + FILTER, istemci tarafında COUNT yok.
 *
 * Boş dizi gelirse veya Supabase yapılandırılmamışsa boş Map döner.
 */
export async function batchFetchStats(
  articleIds: string[],
): Promise<Map<string, ArticleStats>> {
  const result = new Map<string, ArticleStats>();
  if (articleIds.length === 0 || !isSupabaseConfigured()) return result;

  const sb = getSupabase();
  const { data, error } = await sb.rpc("get_batch_article_stats", {
    article_ids: articleIds,
  });

  if (error || !data || !Array.isArray(data)) return result;

  for (const row of data as BatchRow[]) {
    result.set(row.article_id, {
      totalOwners: row.total_owners ?? 0,
      totalUpvotes: row.total_upvotes ?? 0,
      totalDownvotes: row.total_downvotes ?? 0,
      totalComments: row.total_comments ?? 0,
    });
  }

  return result;
}

/**
 * Tek makale için istatistik al — batchFetchStats'ın tek-ID sarmalayıcısı.
 * Detay sayfaları bu fonksiyonu kullanır (signals.ts'deki fetchArticleStats kaldırıldı).
 */
export async function fetchStats(articleId: string): Promise<ArticleStats> {
  const map = await batchFetchStats([articleId]);
  return map.get(articleId) ?? EMPTY_STATS;
}
