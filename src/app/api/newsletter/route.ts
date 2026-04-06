// ─────────────────────────────────────────────────────────────
// AI Rehber — Newsletter API Route
// Resend entegrasyonu ile e-posta abonelik endpoint'i
// RESEND_API_KEY yoksa graceful fallback (loglama)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // Basit email format doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // Resend API Key varsa → gerçek abonelik
    if (resend && RESEND_AUDIENCE_ID) {
      try {
        // Audience'a contact ekle
        await resend.contacts.create({
          email,
          audienceId: RESEND_AUDIENCE_ID,
          unsubscribed: false,
        });

        // Welcome email gönder
        await resend.emails.send({
          from: "AI Rehber <info@airehber.com>",
          to: email,
          subject: "İç Çember'e Hoş Geldin — AI Rehber",
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
                <li><a href="https://airehber.com/haberler" style="color: #a78bfa;">Son AI Haberleri</a></li>
                <li><a href="https://airehber.com/yazilar" style="color: #a78bfa;">Derin Yazılar</a></li>
                <li><a href="https://airehber.com/programlama" style="color: #a78bfa;">Programlama Rehberleri</a></li>
              </ul>
              <p style="font-size: 12px; color: #6b7280; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 16px;">
                AI Rehber — airehber.com
              </p>
            </div>
          `,
        });
      } catch (resendError: unknown) {
        const errorMessage = resendError instanceof Error ? resendError.message : "Resend API hatası";

        // Duplicate contact hatası → başarılı say
        if (errorMessage.includes("already exists")) {
          return NextResponse.json(
            { message: "Zaten abonemizsiniz! Haftalık brifing e-posta adresinize gelmeye devam edecek." },
            { status: 200 }
          );
        }

        // Rate limit veya diğer hatalar
        return NextResponse.json(
          { error: "Servis geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin." },
          { status: 503 }
        );
      }
    } else {
      // Geliştirme ortamı — Resend API Key yok
      if (process.env.NODE_ENV === "development") {
          console.log(`[Newsletter] Yeni abone (dev): ${email}`);
      }
    }

    return NextResponse.json(
      { message: "İç Çember'e hoş geldin! İlk brifing Pazartesi e-posta kutunda olacak." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
