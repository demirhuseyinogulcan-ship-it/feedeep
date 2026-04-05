// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AI Rehber â€” Anasayfa (Feed Model)
// Sosyal medya tarzÄ± sonsuz akÄ±ÅŸ â€” tÃ¼m iÃ§erikler tek feed'de
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteJsonLd, generateMeta } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { ContinueReadingBanner } from "@/components/shared/continue-reading-banner";
import { NewsTicker } from "@/components/shared/the-signal";
import { FeedContainer } from "@/components/feed/feed-container";
import { buildFeed } from "@/lib/feed";

export const metadata: Metadata = generateMeta({
  title: SITE.title,
  description: SITE.description,
  path: "/",
  canonicalPath: "/",
});

// â”€â”€â”€ Veri hazÄ±rlÄ±ÄŸÄ± (build-time, SSG) â”€â”€â”€
const feedItems = buildFeed();

export default function HomePage() {
  return (
    <>
      <JsonLd data={[websiteJsonLd()]} />

      {/* KaldÄ±ÄŸÄ±n Yerden Devam Et */}
      <ContinueReadingBanner />

      {/* GÃ¼ndem: Kayan Haber Åeridi */}
      <NewsTicker />

      {/* Feed: Sonsuz AkÄ±ÅŸ */}
      <main className="pt-6 pb-20">
        <FeedContainer items={feedItems} />
      </main>
    </>
  );
}
