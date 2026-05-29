// ─────────────────────────────────────────────────────────────
// feedeep — Newsletter API Route
// 4 katmanlı güvenlik mimarisi:
//   1. Upstash rate limiting (IP-based sliding window)
//   2. Honeypot bot tespiti (gizli alan)
//   3. Zamanlama kontrolü (< 2s = bot)
//   4. Zod şema validasyonu (yapı + format)
// Resend entegrasyonu ile e-posta abonelik endpoint'i.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { newsletterInputSchema, isSubmissionTimingInvalid } from "@/lib/schemas/newsletter.schema";
import { getNewsletterLimiter, shouldFailClosed } from "@/lib/rate-limit";
import { ZodError } from "zod";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
let resend: Resend | null | undefined;

function getResend() {
  if (!RESEND_API_KEY) return null;
  if (resend === undefined) resend = new Resend(RESEND_API_KEY);
  return resend;
}

/** İstemci IP adresini al (Vercel headers → fallback) */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // ─── Katman 1: Rate Limiting (Upstash) ───
  const limiter = getNewsletterLimiter();
  if (!limiter && shouldFailClosed()) {
    return NextResponse.json(
      { error: "Servis gecici olarak kullanilamiyor." },
      { status: 503 },
    );
  }

  if (limiter) {
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderdiniz. Lütfen bir süre bekleyip tekrar deneyin." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        },
      );
    }
  }

  // ─── Body Parse (boyut kontrolü: JSON.parse DoS önlemi) ───
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 1024) {
      return NextResponse.json(
        { error: "İstek boyutu çok büyük." },
        { status: 413 },
      );
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek formatı." },
      { status: 400 },
    );
  }

  // ─── Katman 2 & 3 & 4: Honeypot + Zamanlama + Zod Validasyon ───
  let input;
  try {
    input = newsletterInputSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      // Honeypot tetiklendi → bot gibi davran: 200 döndür (bot başarılı sandı)
      const isBot = err.issues.some((i) => i.path.includes("_hp"));
      if (isBot) {
        return NextResponse.json(
          { message: "İç Çember'e hoş geldin! İlk brifing Pazartesi e-posta kutunda olacak." },
          { status: 200 },
        );
      }
      const firstError = err.issues[0]?.message ?? "Geçersiz girdi.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    return NextResponse.json({ error: "Geçersiz girdi." }, { status: 400 });
  }

  // Zamanlama kontrolü: çok hızlı = bot → sessiz başarı (bot fark etmez)
  if (isSubmissionTimingInvalid(input._t)) {
    return NextResponse.json(
      { message: "İç Çember'e hoş geldin! İlk brifing Pazartesi e-posta kutunda olacak." },
      { status: 200 },
    );
  }

  // ─── Resend Entegrasyonu ───
  try {
    const resendClient = getResend();
    if (resendClient && RESEND_AUDIENCE_ID) {
      try {
        await resendClient.contacts.create({
          email: input.email,
          audienceId: RESEND_AUDIENCE_ID,
          unsubscribed: false,
        });

        await resendClient.emails.send({
          from: "feedeep <hey@feedeep.com>",
          to: input.email,
          subject: "İç Çember'e Hoş Geldin — feedeep",
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; color: #d1d5db; background: #050505;">
              <h1 style="font-size: 20px; font-weight: 700; color: #f3f4f6; margin-bottom: 16px;">
                İç Çember'e hoş geldin.
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Her Pazartesi, yapay zeka dünyasındaki en önemli gelişmeleri
                ve sadece abonelere özel içgörüleri e-posta kutuna göndereceğiz.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin-top: 16px;">
                Bu arada keşfetmeye başla:
              </p>
              <ul style="font-size: 14px; line-height: 1.8; color: #a78bfa; padding-left: 20px;">
                <li><a href="https://feedeep.com/haberler" style="color: #a78bfa;">Son AI Haberleri</a></li>
                <li><a href="https://feedeep.com/yazilar" style="color: #a78bfa;">Derinlemesine Yazılar</a></li>
              </ul>
              <p style="font-size: 12px; color: #6b7280; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 16px;">
                feedeep — feedeep.com
              </p>
            </div>
          `,
        });
      } catch (resendError: unknown) {
        const errorMessage =
          resendError instanceof Error ? resendError.message : "Resend API hatası";

        if (errorMessage.includes("already exists")) {
          return NextResponse.json(
            { message: "Zaten abonemizsiniz! Haftalık brifing e-posta adresinize gelmeye devam edecek." },
            { status: 200 },
          );
        }

        return NextResponse.json(
          { error: "Servis geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin." },
          { status: 503 },
        );
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Newsletter] Yeni abone (dev): ${input.email}`);
      }
    }

    return NextResponse.json(
      { message: "İç Çember'e hoş geldin! İlk brifing Pazartesi e-posta kutunda olacak." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
