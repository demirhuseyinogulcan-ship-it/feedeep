// ─────────────────────────────────────────────────────────────
// feedeep — Newsletter Schemas (Zod)
// API girdi validasyonu + honeypot bot tespiti.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

/** E-posta format regex — RFC 5322 strict subset */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter abonelik girdi şeması.
 *
 * Güvenlik katmanları:
 * 1. email: format + uzunluk doğrulaması
 * 2. _hp: Honeypot alanı — boş olmalı (bot doldurursa reject)
 * 3. _t: Zamanlama — form render timestamp (çok hızlı = bot)
 */
export const newsletterInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "E-posta adresi çok kısa.")
    .max(254, "E-posta adresi çok uzun.")
    .regex(EMAIL_REGEX, "Geçerli bir e-posta adresi giriniz."),

  /** Honeypot: gizli alan, gerçek kullanıcı boş bırakır, bot doldurur */
  _hp: z.string().max(0, "Bot algılandı.").optional().default(""),

  /** Zamanlama: form'un render edildiği timestamp (ms) */
  _t: z.number().optional(),
});

export type NewsletterInput = z.infer<typeof newsletterInputSchema>;

/**
 * Zamanlama kontrolü: form gönderiminin minimum süresini doğrula.
 * 2 saniyeden hızlı gönderim = bot.
 */
export function isSubmissionTooFast(renderTimestamp?: number): boolean {
  if (!renderTimestamp) return false; // _t yoksa kontrolü atla (graceful)
  const elapsed = Date.now() - renderTimestamp;
  return elapsed < 2000; // 2 saniye
}
