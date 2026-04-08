// ─────────────────────────────────────────────────────────────
// feedeep — Deploy sonrası index tetikleyici webhook endpoint
// Vercel webhook → kriptografik doğrulama → GitHub Action dispatch
//
// 5 katmanlı savunma:
//   1. Rate limit (Upstash sliding window)
//   2. Body size guard (1 KB)
//   3. Kriptografik secret doğrulama (timing-safe)
//   4. Payload sanitizasyonu (string-only whitelist)
//   5. Hata detayı sızdırmama
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSecret } from "@/lib/webhook-auth";
import { apiLimiter } from "@/lib/rate-limit";

const WEBHOOK_SECRET = process.env.INDEXING_WEBHOOK_SECRET;
const GITHUB_INDEXING_TOKEN = process.env.GITHUB_INDEXING_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;

/** Body limiti: 1 KB. Webhook payload küçük olmalı. */
const MAX_BODY_SIZE = 1024;

/** IP adresini al — Vercel x-forwarded-for veya x-real-ip */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Payload'dan sadece güvenli string alan çek.
 * Kullanıcıdan gelen veriyi olduğu gibi GitHub Actions'a iletme.
 */
function sanitizePayload(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const safe: Record<string, string> = {};
  const ALLOWED_KEYS = ["deploymentUrl", "deploymentState", "projectName"];

  for (const key of ALLOWED_KEYS) {
    const val = (raw as Record<string, unknown>)[key];
    if (typeof val === "string" && val.length <= 200) {
      safe[key] = val;
    }
  }
  return safe;
}

export async function POST(request: NextRequest) {
  // ── 0. Config guard ──────────────────────────────────────
  if (!WEBHOOK_SECRET || !GITHUB_INDEXING_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    // İç detay sızdırma — generic 500
    return NextResponse.json({ error: "Sunucu yapılandırma hatası." }, { status: 500 });
  }

  // ── 1. Rate limit ────────────────────────────────────────
  if (apiLimiter) {
    const ip = getClientIp(request);
    const { success } = await apiLimiter.limit(`indexing:${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Çok fazla istek." }, { status: 429 });
    }
  }

  // ── 2. Body size guard ───────────────────────────────────
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload çok büyük." }, { status: 413 });
  }

  // ── 3. Kriptografik secret doğrulama (timing-safe) ──────
  const providedSecret = request.headers.get("x-indexing-secret");
  if (!verifyWebhookSecret(providedSecret, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  // ── 4. Body parse + sanitize ─────────────────────────────
  let safePayload: Record<string, string> = {};
  try {
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Payload çok büyük." }, { status: 413 });
    }
    if (bodyText) {
      safePayload = sanitizePayload(JSON.parse(bodyText));
    }
  } catch {
    // Geçersiz JSON — boş payload ile devam et
    safePayload = {};
  }

  // ── 5. GitHub repository_dispatch ────────────────────────
  const dispatchResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_INDEXING_TOKEN}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        event_type: "vercel_deploy_success",
        client_payload: {
          deploymentState: "READY",
          source: "vercel-webhook",
          receivedAt: new Date().toISOString(),
          ...safePayload,
        },
      }),
    }
  );

  // ── Hata: detay sızdırmadan logla ───────────────────────
  if (!dispatchResponse.ok) {
    // Server-side log (Vercel Functions panelinde görünür)
    console.error(
      "[indexing/trigger] GitHub dispatch failed:",
      dispatchResponse.status,
      await dispatchResponse.text().catch(() => "")
    );

    // İstemciye sadece generic hata
    return NextResponse.json(
      { error: "Dispatch başarısız." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Index pipeline tetiklendi.",
  });
}
