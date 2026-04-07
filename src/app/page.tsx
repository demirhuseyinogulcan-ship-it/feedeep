// ─────────────────────────────────────────────────────────────
// feedeep — Anasayfa (Feed Model)
// Sosyal medya tarzı sonsuz akış — tüm içerikler tek feed'de
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteJsonLd, generateMeta } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { FeedContainer } from "@/components/feed/feed-container";
import { buildFeed } from "@/lib/feed";

export const metadata: Metadata = generateMeta({
  title: SITE.title,
  description: SITE.description,
  path: "/",
  canonicalPath: "/",
});

// ─── Veri hazırlığı (build-time, SSG) ───
const feedItems = buildFeed();

export default function HomePage() {
  return (
    <>
      <JsonLd data={[websiteJsonLd()]} />

      {/* Feed: Sonsuz Akış */}
      <main className="pt-6 pb-20">
        <FeedContainer items={feedItems} />
      </main>
    </>
  );
}
