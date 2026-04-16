// ─────────────────────────────────────────────────────────────
// feedeep — robots.ts (Dynamically generated)
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
          "CCBot",
          "cohere-ai",
        ],
        disallow: ["/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: [
      `${SITE.url}/sitemap.xml`,
      `${SITE.url}/news-sitemap.xml`,
    ],
  };
}
