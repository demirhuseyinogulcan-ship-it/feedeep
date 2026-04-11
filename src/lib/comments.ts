// ─────────────────────────────────────────────────────────────
// feedeep — Comment Data Layer (localStorage + Supabase)
// Threaded reply + vote destekli.
// localStorage: optimistic UI / anonymous fallback.
// Supabase: authenticated kullanıcılar için kalıcı depo.
// ─────────────────────────────────────────────────────────────

import { getSupabase, isSupabaseConfigured, getSessionUserId } from "./supabase";
import {
  supabaseCommentRowSchema,
  supabaseProfileRowSchema,
  supabaseVoteRowSchema,
  commentInputSchema,
  type SupabaseCommentRow,
} from "./schemas/comment.schema";
import { sanitizeText } from "./sanitize";
import { commentLimiter } from "./rate-limit";

const STORAGE_KEY = "feedeep_comments";

// ─── Types ───

export type CommentVote = "up" | "down" | null;

export type Comment = {
  id: string;
  parentId?: string; // reply ise üst yorumun id'si
  text: string;
  image?: string; // base64 data URL veya Supabase storage URL
  vote: CommentVote; // kendi oyumuz
  createdAt: string; // ISO date
  username?: string; // Supabase'den gelen kullanıcı adı
  userId?: string;
};

type CommentStore = Record<string, Comment[]>; // articleId → comments

// ─── localStorage Helpers ───

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStore(): CommentStore {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CommentStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CommentStore): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── Local API (optimistic, anonymous fallback) ───

/** Makaleye yorum veya reply ekle */
export async function addComment(
  articleId: string,
  text: string,
  image?: string,
  parentId?: string,
): Promise<Comment> {
  // Katman 1: Zod girdi validasyonu (yapı + uzunluk)
  const input = commentInputSchema.parse({ text, imageUrl: image, parentId });
  // Katman 2: DOMPurify sanitizasyonu (tüm HTML/JS strip edilir)
  const cleanText = await sanitizeText(input.text);

  if (!cleanText && !image) throw new Error("Yorum boş olamaz.");

  const store = readStore();
  if (!store[articleId]) store[articleId] = [];

  const comment: Comment = {
    id: generateId(),
    ...(parentId ? { parentId } : {}),
    text: cleanText,
    ...(image ? { image } : {}),
    vote: null,
    createdAt: new Date().toISOString(),
  };

  store[articleId].push(comment);
  writeStore(store);

  return comment;
}

/** Makalenin tüm yorumlarını getir (flat, en yeni üstte) */
export function getComments(articleId: string): Comment[] {
  const store = readStore();
  const comments = store[articleId] ?? [];
  return [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Root yorumları getir (parentId yok) */
export function getRootComments(articleId: string): Comment[] {
  return getComments(articleId).filter((c) => !c.parentId);
}

/** Bir yorumun reply'larını getir (en eski üstte — konuşma sırası) */
export function getReplies(articleId: string, parentId: string): Comment[] {
  const store = readStore();
  const comments = store[articleId] ?? [];
  return comments
    .filter((c) => c.parentId === parentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

/** Yorum sil */
export function deleteComment(articleId: string, commentId: string): void {
  const store = readStore();
  if (!store[articleId]) return;
  store[articleId] = store[articleId].filter(
    (c) => c.id !== commentId && c.parentId !== commentId,
  );
  if (store[articleId].length === 0) delete store[articleId];
  writeStore(store);
}

/** Yorum oyla (toggle) */
export function voteComment(
  articleId: string,
  commentId: string,
  type: "up" | "down",
): void {
  const store = readStore();
  if (!store[articleId]) return;
  const comment = store[articleId].find((c) => c.id === commentId);
  if (!comment) return;
  comment.vote = comment.vote === type ? null : type;
  writeStore(store);
}

/** Makalenin yorum sayısı (reply dahil) */
export function getCommentCount(articleId: string): number {
  const store = readStore();
  return store[articleId]?.length ?? 0;
}

// ─── Supabase API ───

/** Supabase'e görsel yükle → public URL döndür */
export async function uploadCommentImage(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;
  const sb = getSupabase();

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await sb.storage.from("comment-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return null;

  const { data: urlData } = sb.storage.from("comment-images").getPublicUrl(path);
  return urlData.publicUrl;
}

/** Makale yorumlarını Supabase'den al */
export async function fetchCommentsFromSupabase(articleId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();

  // Yorumları al (profiles join yok — FK auth.users'a, profiles'a değil)
  const { data, error } = await sb.from("comments")
    .select("id, user_id, article_id, parent_id, text, image_url, created_at")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  // Zod ile DB satırlarını doğrula — geçersiz satırlar sessizce atlanır
  const rows: SupabaseCommentRow[] = [];
  for (const raw of data as unknown[]) {
    const parsed = supabaseCommentRowSchema.safeParse(raw);
    if (parsed.success) rows.push(parsed.data);
  }

  if (rows.length === 0) return [];

  // Benzersiz user_id'leri topla → profiles tablosundan username'leri al
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profilesRaw } = await sb.from("profiles")
    .select("id, username")
    .in("id", userIds);

  const usernameMap: Record<string, string> = {};
  if (profilesRaw) {
    for (const raw of profilesRaw as unknown[]) {
      const parsed = supabaseProfileRowSchema.safeParse(raw);
      if (parsed.success) {
        usernameMap[parsed.data.id] = parsed.data.username;
      }
    }
  }

  // Kullanıcının kendi oylarını al
  const userId = await getSessionUserId();
  const myVotes: Record<string, "up" | "down"> = {};
  if (userId) {
    const { data: voteData } = await sb.from("comment_votes")
      .select("comment_id, vote")
      .eq("user_id", userId);
    if (voteData) {
      for (const raw of voteData as unknown[]) {
        const parsed = supabaseVoteRowSchema.safeParse(raw);
        if (parsed.success) {
          myVotes[parsed.data.comment_id] = parsed.data.vote;
        }
      }
    }
  }

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    parentId: row.parent_id ?? undefined,
    text: row.text,
    image: row.image_url ?? undefined,
    vote: myVotes[row.id] ?? null,
    createdAt: row.created_at,
    username: usernameMap[row.user_id] ?? "Anonim",
  }));
}

/** Supabase'e yorum ekle */
export async function addCommentToSupabase(
  articleId: string,
  text: string,
  imageUrl?: string,
  parentId?: string,
): Promise<Comment | null> {
  if (!isSupabaseConfigured()) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;

  // Rate limit: kullanıcı başına 1 yorum / 30 saniye
  if (commentLimiter) {
    const { success } = await commentLimiter.limit(userId);
    if (!success) {
      throw new Error("\u00c7ok hızlı yorum yapıyorsun. Lütfen 30 saniye bekle.");
    }
  }

  // Katman 1: Zod girdi validasyonu
  const input = commentInputSchema.parse({ text, imageUrl, parentId });
  // Katman 2: DOMPurify sanitizasyonu
  const cleanText = await sanitizeText(input.text);

  if (!cleanText) return null;

  const sb = getSupabase();

  // Username için session'dan al
  const { data: { session } } = await sb.auth.getSession();
  const username = session?.user?.user_metadata?.username ?? "Anonim";

  const { data, error } = await sb.from("comments").insert({
    user_id: userId,
    article_id: articleId,
    text: cleanText,
    image_url: imageUrl ?? null,
    parent_id: parentId ?? null,
  }).select("id, created_at").single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: userId,
    parentId: parentId ?? undefined,
    text: cleanText,
    image: imageUrl ?? undefined,
    vote: null,
    createdAt: data.created_at,
    username,
  };
}

/** Supabase'den yorum sil */
export async function deleteCommentFromSupabase(commentId: string): Promise<boolean> {  const sb = getSupabase();

  const { error } = await sb.from("comments").delete().eq("id", commentId);
  return !error;
}

/** Supabase'de yorum oyla */
export async function voteCommentOnSupabase(
  commentId: string,
  vote: "up" | "down" | null,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  const sb = getSupabase();

  if (vote === null) {
    // Oyu kaldır
    await sb.from("comment_votes")
      .delete()
      .eq("user_id", userId)
      .eq("comment_id", commentId);
  } else {
    // Upsert oy
    await sb.from("comment_votes").upsert(
      { user_id: userId, comment_id: commentId, vote },
      { onConflict: "user_id,comment_id" },
    );
  }
}

export type UserCommentRow = {
  id: string;
  articleId: string;
  text: string;
  createdAt: string;
};

/** Kullanıcının tüm yorumlarını Supabase'den al — ProfilPage için */
export async function fetchUserComments(userId: string): Promise<UserCommentRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();

  const { data, error } = await sb
    .from("comments")
    .select("id, article_id, text, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    articleId: String(row.article_id),
    text: String(row.text),
    createdAt: String(row.created_at),
  }));
}
