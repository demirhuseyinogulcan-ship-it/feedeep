// ─────────────────────────────────────────────────────────────
// feedeep — Push Subscription Schema
// Web Push Protocol (RFC 8291) subscription yapısı için Zod validasyonu.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

/**
 * PushSubscription.toJSON() çıktısı — tarayıcı bu formatı üretir.
 * endpoint: push servisinin URL'si (FCM, Mozilla Push vs.)
 * keys.p256dh: Diffie-Hellman public key (base64url)
 * keys.auth: auth secret (base64url)
 */
export const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url()
    .max(2048)
    .refine(
      (url) =>
        url.startsWith("https://fcm.googleapis.com/") ||
        url.startsWith("https://updates.push.services.mozilla.com/") ||
        url.startsWith("https://") ,
      { message: "Geçersiz push endpoint." }
    ),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(128),
  }),
  expirationTime: z.number().nullable().optional(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

/** Push bildirim payload'u — SW'deki push handler bunu bekler */
export const pushPayloadSchema = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(200),
  url: z.string().max(512).optional().default("/"),
  icon: z.string().max(256).optional(),
});

export type PushPayloadInput = z.infer<typeof pushPayloadSchema>;
