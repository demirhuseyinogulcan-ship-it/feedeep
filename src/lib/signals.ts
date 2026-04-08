// ─────────────────────────────────────────────────────────────
// feedeep — Signal Data Layer (localStorage + Supabase)
// Sahip Ol + Beğen/Beğenme veri katmanı.
// localStorage: optimistic UI / anonymous fallback.
// Supabase: authenticated kullanıcılar için kalıcı depo.
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
    store[articleId] = { owned: false, vote: null };
  }
  return store[articleId];
}

// ─── Local API (optimistic, anonymous fallback) ───

/** Tek makale sinyalini getir (localStorage) */
export function getSignal(articleId: string): Signal {
  const store = readStore();
  return store[articleId] ?? { owned: false, vote: null };
}

/** Sahip Ol toggle (localStorage) */
export function toggleOwnership(articleId: string): Signal {
  const store = readStore();
  const signal = ensureEntry(store, articleId);
  signal.owned = !signal.owned;
  signal.ownedAt = signal.owned ? new Date().toISOString() : undefined;
  writeStore(store);
  return signal;
}

/** Beğen/Beğenme toggle — aynı oy tekrar tıklanırsa kaldırır (localStorage) */
export function toggleVote(articleId: string, type: VoteType): Signal {
  const store = readStore();
  const signal = ensureEntry(store, articleId);
  signal.vote = signal.vote === type ? null : type;
  signal.votedAt = signal.vote ? new Date().toISOString() : undefined;
  writeStore(store);
  return signal;
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

/** Tek makale sinyalini localStorage'a yaz (Supabase'den gelen remote signal'i sync eder) */
export function writeSignal(articleId: string, signal: Signal): void {
  const store = readStore();
  store[articleId] = signal;
  writeStore(store);
}

// ─── Supabase API ───

/** Kullanıcının bu makale için sinyalini Supabase'den al */
export async function fetchUserSignal(articleId: string): Promise<Signal | null> {
  if (!isSupabaseConfigured()) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;
  const sb = getSupabase();

  const { data } = await sb.from("signals")
    .select("owned, vote, owned_at, voted_at")
    .eq("user_id", userId)
    .eq("article_id", articleId)
    .maybeSingle();

  if (!data) return null;
  return {
    owned: data.owned,
    vote: data.vote as VoteType | null,
    ownedAt: data.owned_at ?? undefined,
    votedAt: data.voted_at ?? undefined,
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
    },
    { onConflict: "user_id,article_id" },
  );
}

/** Giriş yapan kullanıcının sahiplendiği makale ID'lerini Supabase'den al */
export async function fetchOwnedIdsFromSupabase(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const userId = await getSessionUserId();
  if (!userId) return [];
  const sb = getSupabase();

  const { data } = await sb.from("signals")
    .select("article_id, owned_at")
    .eq("user_id", userId)
    .eq("owned", true)
    .order("owned_at", { ascending: false });

  return data?.map((r: { article_id: string }) => r.article_id) ?? [];
}
