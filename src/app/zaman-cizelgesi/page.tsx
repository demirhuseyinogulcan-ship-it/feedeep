// ─────────────────────────────────────────────────────────────
// AI Rehber — AI Zaman Çizelgesi Sayfası
// Haberlerden otomatik oluşturulur + ek editoryal kayıtlar
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { haberler } from "#site/content";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { EDITORIAL_TIMELINE } from "@/lib/timeline-data";

export const metadata: Metadata = generateMeta({
  title: "AI Zaman Çizelgesi",
  description:
    "Yapay zeka dünyasındaki önemli gelişmelerin kronolojik, filtrelenebilir zaman çizelgesi.",
  path: "/zaman-cizelgesi",
});

export default function ZamanCizelgesiPage() {
  // Haberlerden timeline oluştur
  const fromHaberler = haberler
    .filter((h) => h.published)
    .map((h) => ({
      date: h.date,
      company: h.sourceName,
      title: h.title,
      url: h.sourceUrl,
    }));

  const all = [...fromHaberler, ...EDITORIAL_TIMELINE];
  const sorted = all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", href: "/" },
          { name: "AI Zaman Çizelgesi", href: "/zaman-cizelgesi" },
        ])}
      />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "AI Zaman Çizelgesi", href: "/zaman-cizelgesi" },
          ]}
        />
        <PageHeader
          title="AI Zaman Çizelgesi"
        description="Yapay zeka dünyasındaki önemli gelişmeler — kronolojik sırayla."
      />

      <div className="space-y-0">
        {sorted.map((item, i) => (
          <div key={i} className="py-5 animate-fade-up" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                {item.company}
              </span>
              <span className="text-[10px] text-gray-800">
                {formatDate(item.date)}
              </span>
            </div>
            <p className="text-sm text-gray-300 font-medium">
              {item.title}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-[10px] font-mono tracking-wider text-gray-700 hover:text-gray-400 transition-colors"
            >
              Kaynak
            </a>
          </div>
        ))}
      </div>
      </section>
    </>
  );
}
