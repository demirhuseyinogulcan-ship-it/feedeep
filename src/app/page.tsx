// ─────────────────────────────────────────────────────────────
// feedeep — Anasayfa (Feed Model)
// Sosyal medya tarzı sonsuz akış — tüm içerikler tek feed'de
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
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
        {/* Arama — feed genişliğiyle hizalı, ortada */}
        <div className="mx-auto max-w-[640px] px-4 sm:px-0 mb-6">
          <Link
            href="/arama"
            className="flex items-center gap-2 h-10 w-full px-5 rounded-full bg-surface-2 border border-white/[0.06] text-sm text-gray-500 hover:text-gray-300 hover:border-white/[0.12] transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>daha derine dal...</span>
          </Link>
        </div>

        <FeedContainer items={feedItems} />
      </main>
    </>
  );
}
