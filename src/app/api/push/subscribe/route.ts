// ─────────────────────────────────────────────────────────────
// feedeep — Push Subscription Endpoint
// Web Push Protocol subscription'larını Supabase'e kaydeder/siler.
//
// Supabase tablosu (bir kez çalıştırılacak SQL):
//
//   create table push_subscriptions (
//     id         uuid        primary key default gen_random_uuid(),
//     endpoint   text        not null unique,
//     p256dh     text        not null,
//     auth       text        not null,
//     user_agent text,
//     created_at timestamptz default now()
//   );
//   alter table push_subscriptions enable row level security;
//   -- Public yazma izni yok: sadece service_role erişebilir
//
// 4 katmanlı güvenlik:
//   1. Rate limiting (Upstash, IP başına 5/saat)
//   2. Body size guard (1 KB)
//   3. Zod şema validasyonu
//   4. Supabase service_role — public erişim kapalı
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import { pushSubscriptionSchema } from "@/lib/schemas/push.schema";
import { pushLimiter } from "@/lib/rate-limit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/** POST /api/push/subscribe — subscription'ı kaydet */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // ─── Katman 1: Rate Limiting ───
  if (pushLimiter) {
    const { success } = await pushLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen bekleyip tekrar deneyin." },
        { status: 429 }
      );
    }
  }

  // ─── Katman 2: Body Size Guard ───
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 2048) {
      return NextResponse.json({ error: "İstek boyutu çok büyük." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  // ─── Katman 3: Zod Validasyon ───
  let sub;
  try {
    sub = pushSubscriptionSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Geçersiz subscription formatı." }, { status: 422 });
    }
    throw err;
  }

  // ─── Katman 4: Supabase'e Kaydet ───
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase yapılandırılmamış — geliştirme ortamında loglayıp geç
    console.warn("[push/subscribe] Supabase yapılandırılmamış, subscription kaydedilmedi.");
    return NextResponse.json({ ok: true });
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
      { onConflict: "endpoint", ignoreDuplicates: false }
    );

  if (error) {
    console.error("[push/subscribe] Supabase upsert hatası:", error.message);
    return NextResponse.json({ error: "Kayıt başarısız." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** DELETE /api/push/subscribe — subscription'ı sil (kullanıcı izni geri aldıysa) */
export async function DELETE(request: NextRequest) {
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 2048) {
      return NextResponse.json({ error: "İstek boyutu çok büyük." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

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
    return NextResponse.json({ ok: true });
  }

  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
