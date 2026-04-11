// ─────────────────────────────────────────────────────────────
// feedeep — Comment Schemas (Zod)
// Supabase DB satır tipleri + kullanıcı girdi validasyonu.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Supabase Row Schemas (DB → App) ───

/** comments tablosu satır yapısı */
export const supabaseCommentRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  article_id: z.string(),
  parent_id: z.string().nullable(),
  text: z.string(),
  image_url: z.string().nullable(),
  created_at: z.string(),
});

export type SupabaseCommentRow = z.infer<typeof supabaseCommentRowSchema>;

/** profiles tablosu satır yapısı */
export const supabaseProfileRowSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export type SupabaseProfileRow = z.infer<typeof supabaseProfileRowSchema>;

/** comment_votes tablosu satır yapısı */
export const supabaseVoteRowSchema = z.object({
  comment_id: z.string(),
  vote: z.enum(["up", "down"]),
});

export type SupabaseVoteRow = z.infer<typeof supabaseVoteRowSchema>;

// ─── Input Validation (User → DB) ───

/** Kullanıcıdan gelen yorum girdi şeması */
export const commentInputSchema = z.object({
  text: z
    .string()
    .trim()
    .max(1000, "Yorum 1000 karakteri aşamaz."),
  imageUrl: z.string().min(1).optional(),
  parentId: z.string().min(1).optional(),
}).refine(
  (data) => data.imageUrl !== undefined || data.text.length >= 10,
  { message: "Yorum en az 10 karakter olmalıdır.", path: ["text"] },
);

export type CommentInput = z.infer<typeof commentInputSchema>;
