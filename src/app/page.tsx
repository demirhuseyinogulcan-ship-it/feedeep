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

const HOME_TITLE = "Yapay Zeka Haberleri ve AI Araç İncelemeleri | feedeep";
const HOME_H1 = "Güncel yapay zeka haberleri, AI araç incelemeleri ve yazılım rehberleri";

export const metadata: Metadata = generateMeta({
  title: HOME_TITLE,
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
        <h1 className="sr-only">{HOME_H1}</h1>
        <FeedContainer items={feedItems} />
      </main>
    </>
  );
}
