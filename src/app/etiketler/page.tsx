// ─────────────────────────────────────────────────────────────
// feedeep — Etiketler İndeks Sayfası
// Tüm tag'leri listeler, her biri hub sayfasına link verir
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { getAllTags, buildTagFeed } from "@/lib/feed";
import { getTagLabel } from "@/lib/constants";

export const metadata: Metadata = generateMeta({
  title: "Etiketler — Konulara Göre İçerikler",
  description:
    "feedeep içeriklerini konulara göre keşfet. Yapay zeka, yazılım, AI ajanları ve daha fazlası.",
  path: "/etiketler",
  keywords: [
    "yapay zeka etiketleri",
    "ai konuları",
    "yazılım konuları",
    "feedeep etiketler",
  ],
});

export default function EtiketlerPage() {
  const tags = getAllTags();

  const tagCounts = tags.map((tag) => ({
    tag,
    label: getTagLabel(tag),
    count: buildTagFeed(tag).length,
  }));

  // En cok icerigi olan tag'ler uste gelsin
  tagCounts.sort((a, b) => b.count - a.count);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Etiketler", href: "/etiketler" },
          ]),
        ]}
      />

      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Etiketler", href: "/etiketler" },
          ]}
        />
        <PageHeader
          title="Etiketler"
          description="Konulara göre içeriklerimizi keşfet."
        />

        {tagCounts.length === 0 ? (
          <p className="text-sm text-gray-500 animate-fade-up">
            Henüz etiketlenmiş içerik yok.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 animate-fade-up delay-100">
            {tagCounts.map(({ tag, label, count }) => (
              <Link
                key={tag}
                href={`/etiketler/${tag}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] text-sm text-gray-400 hover:text-primary-400 hover:border-primary-400/20 transition-colors"
              >
                {label}
                <span className="text-xs text-gray-600">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
