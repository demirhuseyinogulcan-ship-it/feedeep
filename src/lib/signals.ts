// ─────────────────────────────────────────────────────────────
// feedeep — Signal Data Layer (localStorage + Supabase)
// Sahip Ol + Beğen/Beğenme veri katmanı.
// localStorage: optimistic UI / anonymous fallback.
// Supabase: authenticated kullanıcılar için kalıcı depo.
// Conflict resolution: Last-Write-Wins (updatedAt karşılaştırması).
// ─────────────────────────────────────────────────────────────

import { getSupabase, isSupabaseConfigured, getSessionUserId } from "./supabase";

const STORAGE_KEY = "feedeep_signals";

// ─── Types ───

export type VoteType = "upvote" | "downvote";

export type Signal = {
  owned: boolean;
  vote: VoteType | null;
  ownedAt?: string;   // ISO date
  votedAt?: string;   // ISO date
  updatedAt: string;  // ISO date — LWW conflict resolution anahtarı
};

export type SignalStore = Record<string, Signal>;

export type ArticleStats = {
  totalOwners: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalComments: number;
};

// ─── localStorage Helpers ───

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStore(): SignalStore {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SignalStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: SignalStore): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function ensureEntry(store: SignalStore, articleId: string): Signal {
  if (!store[articleId]) {
    store[articleId] = { owned: false, vote: null, updatedAt: new Date().toISOString() };
  }
  return store[articleId];
}

// ─── Local API (optimistic, anonymous fallback) ───

/** Tek makale sinyalini getir (localStorage) */
export function getSignal(articleId: string): Signal {
  const store = readStore();
  return store[articleId] ?? { owned: false, vote: null, updatedAt: new Date().toISOString() };
}

/** Sahip Ol toggle (localStorage) */
export function toggleOwnership(articleId: string): Signal {
  const store = readStore();
  const signal = ensureEntry(store, articleId);
  const now = new Date().toISOString();
  signal.owned = !signal.owned;
  signal.ownedAt = signal.owned ? now : undefined;
  signal.updatedAt = now;
  writeStore(store);
  return signal;
}

/** Beğen/Beğenme toggle — aynı oy tekrar tıklanırsa kaldırır (localStorage) */
export function toggleVote(articleId: string, type: VoteType): Signal {
  const store = readStore();
  const signal = ensureEntry(store, articleId);
  const now = new Date().toISOString();
  signal.vote = signal.vote === type ? null : type;
  signal.votedAt = signal.vote ? now : undefined;
  signal.updatedAt = now;
  writeStore(store);
  return signal;
}

/** Tek makale sinyalini localStorage'a yaz (remote sync sonrası kullan) */
export function writeSignal(articleId: string, signal: Signal): void {
  const store = readStore();
  store[articleId] = signal;
  writeStore(store);
}

/** Tüm sahiplenilen makale ID'lerini getir (localStorage) */
export function getOwnedIds(): string[] {
  const store = readStore();
  return Object.entries(store)
    .filter(([, s]) => s.owned)
    .sort((a, b) => {
      const aDate = a[1].ownedAt ?? "";
      const bDate = b[1].ownedAt ?? "";
      return bDate.localeCompare(aDate);
    })
    .map(([id]) => id);
}

/** Toplam sahiplenme sayısı (localStorage) */
export function getOwnedCount(): number {
  const store = readStore();
  return Object.values(store).filter((s) => s.owned).length;
}

/** Tüm store'u getir (debug / export) */
export function getAllSignals(): SignalStore {
  return readStore();
}

// ─── Supabase API ───

/** Kullanıcının bu makale için sinyalini Supabase'den al */
export async function fetchUserSignal(articleId: string): Promise<Signal | null> {
  if (!isSupabaseConfigured()) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;
  const sb = getSupabase();

  const { data } = await sb.from("signals")
    .select("owned, vote, owned_at, voted_at, updated_at")
    .eq("user_id", userId)
    .eq("article_id", articleId)
    .maybeSingle();

  if (!data) return null;
  return {
    owned: data.owned,
    vote: data.vote as VoteType | null,
    ownedAt: data.owned_at ?? undefined,
    votedAt: data.voted_at ?? undefined,
    updatedAt: data.updated_at ?? new Date().toISOString(),
  };
}

/** Kullanıcının sinyalini Supabase'e yaz (upsert) */
export async function syncSignalToSupabase(articleId: string, signal: Signal): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  const sb = getSupabase();

  await sb.from("signals").upsert(
    {
      user_id: userId,
      article_id: articleId,
      owned: signal.owned,
      vote: signal.vote,
      owned_at: signal.ownedAt ?? null,
      voted_at: signal.votedAt ?? null,
      updated_at: signal.updatedAt,
    },
    { onConflict: "user_id,article_id" },
  );
}

/** Tüm localStorage sinyallerini Supabase ile çift yönlü sync et.
 *  Last-Write-Wins: updatedAt daha yeni olan kazanır.
 *  Auth state değişiminde (anonim→kalıcı, login) çağrılır. */
export async function syncAllSignals(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  const sb = getSupabase();

  const localStore = readStore();
  const localIds = Object.keys(localStore);

  // Remote sinyalleri çek
  const { data: remoteRows } = await sb
    .from("signals")
    .select("article_id, owned, vote, owned_at, voted_at, updated_at")
    .eq("user_id", userId);

  const remoteMap = new Map<string, Signal & { articleId: string }>();
  if (remoteRows) {
    for (const row of remoteRows) {
      remoteMap.set(row.article_id as string, {
        owned: row.owned as boolean,
        vote: row.vote as VoteType | null,
        ownedAt: (row.owned_at as string) ?? undefined,
        votedAt: (row.voted_at as string) ?? undefined,
        updatedAt: (row.updated_at as string) ?? "1970-01-01T00:00:00.000Z",
        articleId: row.article_id as string,
      });
    }
  }

  // Tüm benzersiz article ID'lerini topla
  const allIds = new Set([...localIds, ...remoteMap.keys()]);
  const toUpsert: Array<{
    user_id: string;
    article_id: string;
    owned: boolean;
    vote: VoteType | null;
    owned_at: string | null;
    voted_at: string | null;
    updated_at: string;
  }> = [];
  const mergedStore: SignalStore = {};

  for (const id of allIds) {
    const local = localStore[id];
    const remote = remoteMap.get(id);

    if (local && !remote) {
      // Sadece local'de var — Supabase'e push et
      toUpsert.push({
        user_id: userId,
        article_id: id,
        owned: local.owned,
        vote: local.vote,
        owned_at: local.ownedAt ?? null,
        voted_at: local.votedAt ?? null,
        updated_at: local.updatedAt,
      });
      mergedStore[id] = local;
    } else if (!local && remote) {
      // Sadece remote'da var — localStorage'a çek
      mergedStore[id] = {
        owned: remote.owned,
        vote: remote.vote,
        ownedAt: remote.ownedAt,
        votedAt: remote.votedAt,
        updatedAt: remote.updatedAt,
      };
    } else if (local && remote) {
      // İkisinde de var — LWW: updatedAt daha yeni olan kazanır
      const localTime = local.updatedAt ?? "1970-01-01T00:00:00.000Z";
      const remoteTime = remote.updatedAt ?? "1970-01-01T00:00:00.000Z";

      if (localTime > remoteTime) {
        // Local daha yeni — Supabase'e push et
        toUpsert.push({
          user_id: userId,
          article_id: id,
          owned: local.owned,
          vote: local.vote,
          owned_at: local.ownedAt ?? null,
          voted_at: local.votedAt ?? null,
          updated_at: local.updatedAt,
        });
        mergedStore[id] = local;
      } else {
        // Remote daha yeni (veya eşit) — remote kazanır
        mergedStore[id] = {
          owned: remote.owned,
          vote: remote.vote,
          ownedAt: remote.ownedAt,
          votedAt: remote.votedAt,
          updatedAt: remote.updatedAt,
        };
      }
    }
  }

  // Toplu upsert — tek sorgu
  if (toUpsert.length > 0) {
    await sb.from("signals").upsert(toUpsert, { onConflict: "user_id,article_id" });
  }

  // localStorage'ı merged sonuçla güncelle
  writeStore(mergedStore);
}

/** Kullanıcının sahiplendiği article ID'lerini Supabase'den al — KoleksiyonPage için */
export async function fetchOwnedIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();

  const { data, error } = await sb
    .from("signals")
    .select("article_id")
    .eq("user_id", userId)
    .eq("owned", true)
    .order("owned_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return (data as Array<{ article_id: string }>).map((r) => r.article_id);
}
