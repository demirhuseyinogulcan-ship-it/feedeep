import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSecret } from "@/lib/webhook-auth";
import { getApiLimiter } from "@/lib/rate-limit";

const WEBHOOK_SECRET = process.env.INDEXING_WEBHOOK_SECRET;
const GITHUB_INDEXING_TOKEN = process.env.GITHUB_INDEXING_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;

const MAX_BODY_SIZE = 1024;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function sanitizePayload(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const safe: Record<string, string> = {};
  const allowedKeys = ["deploymentUrl", "deploymentState", "projectName"];

  for (const key of allowedKeys) {
    const val = (raw as Record<string, unknown>)[key];
    if (typeof val === "string" && val.length <= 200) safe[key] = val;
  }

  return safe;
}

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("[indexing/trigger] INDEXING_WEBHOOK_SECRET is missing.");
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const limiter = getApiLimiter();
  if (limiter) {
    const ip = getClientIp(request);
    const { success } = await limiter.limit(`indexing:${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Cok fazla istek." }, { status: 429 });
    }
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload cok buyuk." }, { status: 413 });
  }

  const providedSecret = request.headers.get("x-indexing-secret");
  if (!verifyWebhookSecret(providedSecret, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!GITHUB_INDEXING_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    console.error("[indexing/trigger] GitHub dispatch configuration is missing.");
    return NextResponse.json({ error: "Servis gecici olarak kullanilamiyor." }, { status: 503 });
  }

  let safePayload: Record<string, string> = {};
  try {
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Payload cok buyuk." }, { status: 413 });
    }
    if (bodyText) safePayload = sanitizePayload(JSON.parse(bodyText));
  } catch {
    safePayload = {};
  }

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
    },
  );

  if (!dispatchResponse.ok) {
    console.error(
      "[indexing/trigger] GitHub dispatch failed:",
      dispatchResponse.status,
      await dispatchResponse.text().catch(() => ""),
    );

    return NextResponse.json(
      { error: "Dispatch basarisiz." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Index pipeline tetiklendi.",
  });
}
