import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { haberler, yazilar } from "#site/content";
import { getApiLimiter, shouldFailClosed } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const validArticleIds = new Set([
  ...yazilar.filter((item) => item.published).map((item) => `yazi-${item.slug}`),
  ...haberler.filter((item) => item.published).map((item) => `haber-${item.slug}`),
]);

const statsRequestSchema = z.object({
  articleIds: z
    .array(z.string().regex(/^(haber|yazi)-[a-z0-9-]+$/).max(180))
    .min(1)
    .max(100),
});

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const limiter = getApiLimiter();
  if (!limiter && shouldFailClosed()) {
    return NextResponse.json(
      { error: "Servis gecici olarak kullanilamiyor." },
      { status: 503 },
    );
  }

  if (limiter) {
    const { success } = await limiter.limit(`stats:${getClientIp(request)}`);
    if (!success) {
      return NextResponse.json({ error: "Cok fazla istek." }, { status: 429 });
    }
  }

  let payload: z.infer<typeof statsRequestSchema>;
  try {
    const text = await request.text();
    if (text.length > 4096) {
      return NextResponse.json({ error: "Istek boyutu cok buyuk." }, { status: 413 });
    }
    payload = statsRequestSchema.parse(JSON.parse(text));
  } catch (err) {
    const status = err instanceof ZodError ? 422 : 400;
    return NextResponse.json({ error: "Gecersiz istek." }, { status });
  }

  const articleIds = [...new Set(payload.articleIds)].filter((id) => validArticleIds.has(id));
  if (articleIds.length === 0) return NextResponse.json([]);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Servis gecici olarak kullanilamiyor." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("get_batch_article_stats", {
    article_ids: articleIds,
  });

  if (error || !data) {
    console.error("[stats] get_batch_article_stats failed:", error?.message);
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
