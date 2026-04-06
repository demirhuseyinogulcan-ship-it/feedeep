// ─────────────────────────────────────────────────────────────
// AI Rehber — RSS Feed Route (Velite)
// ─────────────────────────────────────────────────────────────

import { SITE } from "@/lib/constants";
import { yazilar, haberler } from "#site/content";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // Combine yazilar + haberler, sort by date desc
  type FeedEntry = {
    title: string;
    url: string;
    description: string;
    date: string;
    category?: string;
  };

  const entries: FeedEntry[] = [
    ...yazilar
      .filter((y) => y.published)
      .map((y) => ({
        title: y.title,
        url: `${SITE.url}/yazilar/${y.slug}`,
        description: y.description,
        date: y.date,
        category: y.category,
      })),
    ...haberler
      .filter((h) => h.published)
      .map((h) => ({
        title: h.title,
        url: `${SITE.url}/haberler/${h.slug}`,
        description: h.description,
        date: h.date,
        category: h.category,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const feedItems = entries
    .map(
      (entry) => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${entry.url}</link>
      <description>${escapeXml(entry.description)}</description>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${entry.url}</guid>${entry.category ? `\n      <category>${escapeXml(entry.category)}</category>` : ""}
      <content:encoded><![CDATA[<p>${escapeXml(entry.description)}</p><p><a href="${entry.url}">Devamini oku</a></p>]]></content:encoded>
    </item>`
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE.name}</title>
    <link>${SITE.url}</link>
    <description>${SITE.description}</description>
    <language>${SITE.language}</language>
    <managingEditor>${SITE.author.email} (${SITE.author.name})</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>`;

  return new Response(feed.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
