// ─────────────────────────────────────────────────────────────
// AI Rehber — Deploy sonrası index tetikleyici webhook endpoint
// Vercel webhook çağrısını doğrular ve GitHub Action dispatch eder
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.INDEXING_WEBHOOK_SECRET;
const GITHUB_INDEXING_TOKEN = process.env.GITHUB_INDEXING_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET || !GITHUB_INDEXING_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    return NextResponse.json(
      { error: "Indexing webhook yapılandırması eksik." },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-indexing-secret");

  if (providedSecret !== WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Yetkisiz webhook isteği." },
      { status: 401 }
    );
  }

  let payload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
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
          payload,
        },
      }),
    }
  );

  if (!dispatchResponse.ok) {
    const errorText = await dispatchResponse.text();

    return NextResponse.json(
      {
        error: "GitHub Action tetiklenemedi.",
        details: errorText,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Index pipeline tetiklendi.",
  });
}
