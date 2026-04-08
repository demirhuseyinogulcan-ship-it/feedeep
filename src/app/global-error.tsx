// ─────────────────────────────────────────────────────────────
// feedeep — Global Error Boundary (Layout-level)
// Root layout coktugunde devreye girer.
// Kendi <html><body> saglamak ZORUNDA — layout artik yok.
// The Void: inline stiller kullanilir (CSS dosyalari yuklenemez).
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[feedeep] Layout-seviye hata:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#e5e7eb",
        }}
      >
        <div style={{ maxWidth: 420, padding: "0 24px", textAlign: "center" }}>
          {/* Mor sinyal vurgusu */}
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 24px",
              borderRadius: "50%",
              border: "1px solid rgba(139,92,246,0.2)",
              background: "rgba(139,92,246,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a78bfa"
              strokeWidth={1.5}
              width={32}
              height={32}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.981 0 13.788"
              />
              <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
              color: "#f3f4f6",
            }}
          >
            Sinyal Tamamen Koptu
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Platform yuklenirken kritik bir kesinti yasandi.
            Tekrar baglanmayi dene.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: "#374151",
                marginBottom: 24,
                letterSpacing: "0.05em",
              }}
            >
              #{error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              background: "#7c3aed",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
