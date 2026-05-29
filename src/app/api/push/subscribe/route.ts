import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { pushSubscriptionSchema } from "@/lib/schemas/push.schema";
import { getPushLimiter, shouldFailClosed } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function enforcePushRateLimit(request: NextRequest) {
  const limiter = getPushLimiter();
  if (!limiter && shouldFailClosed()) {
    return NextResponse.json(
      { error: "Servis gecici olarak kullanilamiyor." },
      { status: 503 },
    );
  }

  if (!limiter) return null;

  const { success } = await limiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json(
      { error: "Cok fazla istek. Lutfen bekleyip tekrar deneyin." },
      { status: 429 },
    );
  }

  return null;
}

async function readJsonBody(request: NextRequest) {
  const text = await request.text();
  if (text.length > 2048) {
    return {
      response: NextResponse.json({ error: "Istek boyutu cok buyuk." }, { status: 413 }),
      body: null,
    };
  }

  try {
    return { response: null, body: JSON.parse(text) as unknown };
  } catch {
    return {
      response: NextResponse.json({ error: "Gecersiz JSON." }, { status: 400 }),
      body: null,
    };
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforcePushRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { response, body } = await readJsonBody(request);
  if (response) return response;

  let sub;
  try {
    sub = pushSubscriptionSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Gecersiz subscription formati." }, { status: 422 });
    }
    throw err;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Servis gecici olarak kullanilamiyor." },
      { status: 503 },
    );
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_agent: request.headers.get("user-agent")?.slice(0, 256) ?? null,
      },
      { onConflict: "endpoint", ignoreDuplicates: false },
    );

  if (error) {
    console.error("[push/subscribe] Supabase upsert failed:", error.message);
    return NextResponse.json({ error: "Kayit basarisiz." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await enforcePushRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { response, body } = await readJsonBody(request);
  if (response) return response;

  const endpoint =
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    typeof (body as Record<string, unknown>).endpoint === "string"
      ? (body as Record<string, string>).endpoint
      : null;

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint gerekli." }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Servis gecici olarak kullanilamiyor." },
      { status: 503 },
    );
  }

  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
