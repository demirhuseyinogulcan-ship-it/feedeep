// ─────────────────────────────────────────────────────────────
// feedeep — OG Image API Route (next/og + Satori)
// Otomatik yazı kartı üretimi
// ─────────────────────────────────────────────────────────────

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { SITE } from "@/lib/constants";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "feedeep";
  const category = searchParams.get("category") ?? "";
  const date = searchParams.get("date") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a1145 50%, #2d1b69 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Top — Logo & Category */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Logo placeholder — stil ile */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8B5CF6, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              fd
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#c4b5fd",
              }}
            >
              feedeep
            </span>
          </div>

          {category && (
            <div
              style={{
                background: "rgba(139, 92, 246, 0.2)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "16px",
                color: "#c4b5fd",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Center — Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? "40px" : title.length > 40 ? "48px" : "56px",
              fontWeight: "bold",
              color: "white",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "90%",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom — Author & Date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #8B5CF6, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {SITE.author.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <span
              style={{
                fontSize: "18px",
                color: "#a78bfa",
              }}
            >
              {SITE.author.name}
            </span>
          </div>
          {date && (
            <span
              style={{
                fontSize: "16px",
                color: "#6b7280",
              }}
            >
              {date}
            </span>
          )}
          <span
            style={{
              fontSize: "16px",
              color: "#6b7280",
            }}
          >
            feedeep.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
