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
      // Eğitim botları — içerik model eğitimi için kullanılamaz
      {
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "ClaudeBot",
          "CCBot",
          "cohere-ai",
          "Applebot-Extended",
          "Amazonbot",
          "Bytespider",
          "Diffbot",
          "AI2Bot",
        ],
        disallow: ["/"],
      },
      // Browsing botları — gerçek zamanlı referans ve kaynak gösterimi için izinli
      {
        userAgent: [
          "ChatGPT-User",
          "Anthropic-AI",
          "PerplexityBot",
          "Meta-ExternalAgent",
          "Meta-ExternalFetcher",
          "YouBot",
        ],
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
