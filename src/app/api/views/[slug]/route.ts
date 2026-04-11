// ─────────────────────────────────────────────────────────────
// feedeep — View Count API
// POST: Görüntülenme sayacını artır (Redis IP dedup + Supabase atomic)
// Çift katmanlı spam koruması:
//   1. Client: sessionStorage (aynı oturumda tekrar atılmaz)
//   2. Server: Redis IP hash (24h TTL — aynı IP tekrar sayılmaz)
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { redis } from "@/lib/upstash";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || !isSupabaseConfigured()) {
    return new Response(null, { status: 204 });
  }

  // Redis dedup: aynı IP 24 saat içinde tekrar sayılmasın
  if (redis) {
    const ip = getClientIp(req);
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const key = `feedeep:view:${slug}:${ipHash}`;

    const exists = await redis.get(key);
    if (exists) return new Response(null, { status: 204 });

    await redis.set(key, 1, { ex: 86400 }); // 24h TTL
  }

  // Supabase atomic increment
  const sb = getSupabase();
  await sb.rpc("increment_view", { p_article_id: slug });

  return new Response(null, { status: 204 });
}
