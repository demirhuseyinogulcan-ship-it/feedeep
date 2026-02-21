// ─────────────────────────────────────────────────────────────
// AI Rehber — Google News Sitemap
// Google News'e dahil olmak için özel haber sitemap'i
// Son 2 gün içindeki haberler (Google News gerekliliği)
// ─────────────────────────────────────────────────────────────

import { haberler } from "#site/content";
import { SITE } from "@/lib/constants";

export async function GET() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentNews = haberler
    .filter((h) => h.published && new Date(h.date) >= twoDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews
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
      <news:keywords>${h.keywords?.join(", ") ?? ""}</news:keywords>
    </news:news>
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
