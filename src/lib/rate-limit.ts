// ─────────────────────────────────────────────────────────────
// feedeep — Rate Limiter (Upstash Redis)
// Serverless-native sliding window rate limiting.
// Upstash env yoksa → graceful degrade (izin verir + uyarı loglar).
// ─────────────────────────────────────────────────────────────

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Upstash Redis tabanlı rate limiter.
 * Sliding window: belirtilen zaman aralığında max istek sayısı.
 * Upstash env yoksa null döner — çağıran kod graceful degrade eder.
 */
function createRateLimiter(requests: number, window: `${number} s` | `${number} m` | `${number} h` | `${number} d`) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;

  return new Ratelimit({
    redis: new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "feedeep:ratelimit",
  });
}

// ─── Önceden tanımlı limiter'lar ───

/** Newsletter: IP başına 5 istek / 1 saat */
export const newsletterLimiter = createRateLimiter(5, "1 h");

/** Genel API: IP başına 30 istek / 1 dakika */
export const apiLimiter = createRateLimiter(30, "1 m");

/** Push Subscription: IP başına 5 kayıt / 1 saat */
export const pushLimiter = createRateLimiter(5, "1 h");
