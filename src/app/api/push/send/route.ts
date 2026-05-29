// ─────────────────────────────────────────────────────────────
// feedeep — Push Send Endpoint (Admin)
// Kayıtlı tüm subscriber'lara Web Push bildirimi gönderir.
//
// Test curl komutu:
//   curl -X POST https://feedeep.com/api/push/send \
//     -H "Content-Type: application/json" \
//     -H "Authorization: Bearer $PUSH_SEND_SECRET" \
//     -d '{"title":"Yeni içerik","body":"Test bildirimi","url":"/haberler"}'
//
// Güvenlik:
//   1. PUSH_SEND_SECRET ile timing-safe bearer token doğrulama
//   2. Body size guard (1 KB)
//   3. Zod şema validasyonu
//   4. Başarısız/süresi dolmuş subscription'lar otomatik temizlenir
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { ZodError } from "zod";
import { pushPayloadSchema } from "@/lib/schemas/push.schema";
import { verifyWebhookSecret } from "@/lib/webhook-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const PUSH_SEND_SECRET = process.env.PUSH_SEND_SECRET;

type SubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function POST(request: NextRequest) {
  // ─── Authorization ───
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!PUSH_SEND_SECRET || !verifyWebhookSecret(bearer, PUSH_SEND_SECRET)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  // ─── VAPID Kontrolü ───
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "VAPID anahtarları yapılandırılmamış." },
      { status: 500 }
    );
  }

  webpush.setVapidDetails(
    "mailto:hey@feedeep.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  // ─── Body Parse ───
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 1024) {
      return NextResponse.json({ error: "İstek boyutu çok büyük." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  // ─── Zod Validasyon ───
  let payload;
  try {
    payload = pushPayloadSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Geçersiz payload." }, { status: 422 });
    }
    throw err;
  }

  // ─── Supabase'den subscription'ları al ───
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 500 });
  }

  const { data: subscriptions, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (fetchError) {
    console.error("[push/send] Supabase fetch hatası:", fetchError.message);
    return NextResponse.json({ error: "Subscription listesi alınamadı." }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0 });
  }

  // ─── Push bildirim gönder ───
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
    icon: payload.icon ?? "/icon-192.png",
    badge: "/icon-192.png",
  });

  let sent = 0;
  let failed = 0;
  const expiredEndpoints: string[] = [];

  await Promise.allSettled(
    (subscriptions as SubscriptionRow[]).map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload
        );
        sent++;
      } catch (err) {
        failed++;
        // HTTP 410 Gone veya 404 = subscription süresi dolmuş, temizle
        if (
          err instanceof Error &&
          "statusCode" in err &&
          ((err as { statusCode: number }).statusCode === 410 ||
            (err as { statusCode: number }).statusCode === 404)
        ) {
          expiredEndpoints.push(sub.endpoint);
        } else {
          console.warn("[push/send] Gönderim hatası:", sub.endpoint.slice(0, 60), err);
        }
      }
    })
  );

  // ─── Süresi dolmuş subscription'ları temizle ───
  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return NextResponse.json({ ok: true, sent, failed, cleaned: expiredEndpoints.length });
}
