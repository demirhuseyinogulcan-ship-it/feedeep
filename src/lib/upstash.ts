// ─────────────────────────────────────────────────────────────
// feedeep — Upstash Redis Client (shared singleton)
// Rate limiting + view dedup + gelecek cache ihtiyaçları için.
// Env yoksa null döner — çağıran kod graceful degrade eder.
// ─────────────────────────────────────────────────────────────

import { Redis } from "@upstash/redis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: Redis | null | undefined;

export function isRedisConfigured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;
  if (redisClient === undefined) {
    redisClient = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redisClient;
}
