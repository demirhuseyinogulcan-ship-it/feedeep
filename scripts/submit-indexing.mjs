#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────
// feedeep — Google Search Console Sitemap Submit Script
// Deploy sonrası sitemap/news-sitemap submit ederek keşfi hızlandırır
// ─────────────────────────────────────────────────────────────

import { google } from "googleapis";

const SITE_URL = process.env.GSC_SITE_URL || "https://feedeep.com/";
const SITEMAP_URLS = [
  `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  `${SITE_URL.replace(/\/$/, "")}/news-sitemap.xml`,
];

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Eksik ortam değişkeni: ${name}`);
  }
}

async function submitSitemaps() {
  requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL", SERVICE_ACCOUNT_EMAIL);
  requireEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", SERVICE_ACCOUNT_PRIVATE_KEY);

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });

  const webmasters = google.webmasters({ version: "v3", auth });

  const results = [];

  for (const feedpath of SITEMAP_URLS) {
    try {
      await webmasters.sitemaps.submit({
        siteUrl: SITE_URL,
        feedpath,
      });

      results.push({ feedpath, status: "ok" });
      console.log(`✅ Sitemap submit başarılı: ${feedpath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      results.push({ feedpath, status: "error", message });
      console.error(`❌ Sitemap submit hatası: ${feedpath}`);
      console.error(`   ↳ ${message}`);
    }
  }

  const failed = results.filter((result) => result.status === "error");

  if (failed.length > 0) {
    const summary = failed.map((result) => `${result.feedpath}: ${result.message}`).join(" | ");
    throw new Error(`Sitemap submit kısmi/başarısız: ${summary}`);
  }

  console.log("\n🎯 Tüm sitemap submit işlemleri tamamlandı.");
}

submitSitemaps().catch((error) => {
  const message = error instanceof Error ? error.message : "Bilinmeyen hata";
  console.error(`\n🚨 Index pipeline başarısız: ${message}`);
  process.exit(1);
});
