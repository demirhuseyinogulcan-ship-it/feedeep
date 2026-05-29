import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { haberler, yazilar } from "#site/content";
import { getRedis } from "@/lib/upstash";
import { shouldFailClosed } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isSupabaseConfigured } from "@/lib/supabase";

const validArticleIds = new Set([
  ...yazilar.filter((item) => item.published).map((item) => `yazi-${item.slug}`),
  ...haberler.filter((item) => item.published).map((item) => `haber-${item.slug}`),
]);

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isValidArticleId(slug: string): boolean {
  return slug.length <= 180 && /^(haber|yazi)-[a-z0-9-]+$/.test(slug) && validArticleIds.has(slug);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || !isValidArticleId(slug)) {
    return new Response(null, { status: 404 });
  }

  if (!isSupabaseConfigured()) {
    return new Response(null, { status: 204 });
  }

  const redis = getRedis();
  if (!redis && shouldFailClosed()) {
    console.warn("[views] Redis is not configured; view increment skipped.");
    return new Response(null, { status: 204 });
  }

  if (redis) {
    const ip = getClientIp(req);
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const key = `feedeep:view:${slug}:${ipHash}`;

    const exists = await redis.get(key);
    if (exists) return new Response(null, { status: 204 });

    await redis.set(key, 1, { ex: 86400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    console.warn("[views] Supabase admin is not configured; view increment skipped.");
    return new Response(null, { status: 204 });
  }

  const { error } = await sb.rpc("increment_view", { p_article_id: slug });
  if (error) console.warn("[views] increment_view failed:", error.message);

  return new Response(null, { status: 204 });
}
