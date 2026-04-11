// ─────────────────────────────────────────────────────────────
// feedeep — Popular Articles API
// GET: En çok görüntülenen makaleleri döndürür (sidebar widget için)
// Supabase RPC: get_popular_articles(p_limit)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "5");
  const safeLimit = Math.min(Math.max(limit, 1), 20);

  const sb = getSupabase();
  const { data, error } = await sb.rpc("get_popular_articles", {
    p_limit: safeLimit,
  });

  if (error || !data) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
