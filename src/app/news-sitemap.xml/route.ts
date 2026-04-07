// ─────────────────────────────────────────────────────────────
// feedeep — Google News Sitemap
// Google News için özel haber sitemap'i
// Son 30 gün içindeki yayınlanmış haberler
// ─────────────────────────────────────────────────────────────

import { haberler } from "#site/content";
import { SITE } from "@/lib/constants";

export async function GET() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentNews = haberler
    .filter((h) => h.published && new Date(h.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${recentNews.length === 0
  ? `  <url>
    <loc>${SITE.url}/haberler</loc>
  </url>`
  : recentNews
  .map(
    (h) => `  <url>
    <loc>${SITE.url}/haberler/${h.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE.organization.name}</news:name>
        <news:language>${SITE.language}</news:language>
      </news:publication>
      <news:publication_date>${new Date(h.date).toISOString()}</news:publication_date>
      <news:title>${escapeXml(h.title)}</news:title>
    </news:news>
    <image:image>
      <image:loc>${SITE.url}/api/og?title=${encodeURIComponent(h.title)}</image:loc>
      <image:title>${escapeXml(h.title)}</image:title>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
