// ─────────────────────────────────────────────────────────────
// AI Rehber — robots.ts (Dynamically generated)
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/llms.txt", "/llms-full.txt", "/yazilar/", "/haberler/", "/prompt-kutuphanesi/", "/modeller/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/llms.txt", "/llms-full.txt"],
      },
      {
        userAgent: "Anthropic-AI",
        allow: ["/llms.txt", "/llms-full.txt"],
      },
    ],
    sitemap: [
      `${SITE.url}/sitemap.xml`,
      `${SITE.url}/news-sitemap.xml`,
    ],
    host: SITE.url,
  };
}
