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
        disallow: ["/api/"],
      },
      {
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "ChatGPT-User",
          "Anthropic-AI",
          "ClaudeBot",
          "PerplexityBot",
          "CCBot",
          "cohere-ai",
        ],
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: [
      `${SITE.url}/sitemap.xml`,
      `${SITE.url}/news-sitemap.xml`,
    ],
    host: SITE.url,
  };
}
