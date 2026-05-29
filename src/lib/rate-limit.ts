import { Ratelimit } from "@upstash/ratelimit";
import { getRedis, isRedisConfigured } from "./upstash";

type RateLimitWindow = `${number} s` | `${number} m` | `${number} h` | `${number} d`;

function createRateLimiter(requests: number, window: RateLimitWindow) {
  const redis = getRedis();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "feedeep:ratelimit",
  });
}

function lazyRateLimiter(requests: number, window: RateLimitWindow) {
  let limiter: Ratelimit | null | undefined;

  return () => {
    if (limiter === undefined) limiter = createRateLimiter(requests, window);
    return limiter;
  };
}

export function shouldFailClosed(): boolean {
  return process.env.NODE_ENV === "production" && process.env.FEEDEEP_SECURITY_FAIL_OPEN !== "true";
}

export function isRateLimitingConfigured(): boolean {
  return isRedisConfigured();
}

export const getNewsletterLimiter = lazyRateLimiter(5, "1 h");
export const getApiLimiter = lazyRateLimiter(30, "1 m");
export const getPushLimiter = lazyRateLimiter(5, "1 h");
