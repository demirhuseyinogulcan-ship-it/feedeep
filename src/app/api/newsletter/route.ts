// ─────────────────────────────────────────────────────────────
// AI Rehber — Newsletter API Route
// E-posta abonelik endpoint'i
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // TODO: E-posta servisine gönder (Resend, Buttondown, Mailchimp vb.)
    // Şu an sadece loglama yapıyor
    console.log(`[Newsletter] Yeni abone: ${email}`);

    return NextResponse.json(
      { message: "Başarıyla abone oldunuz! Haftalık brifing e-posta adresinize gelecek." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
