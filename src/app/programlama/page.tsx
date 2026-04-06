// ─────────────────────────────────────────────────────────────
// AI Rehber — Programlama Ana Sayfası (/programlama)
// Tüm rehberlerin listelendiği pillar hub sayfası
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { rehberler } from "#site/content";
import { generateMeta, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { GUIDE_TECHNOLOGIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { TiltCard } from "@/components/shared/tilt-card";

export const metadata: Metadata = generateMeta({
  title: "Programlama Rehberleri — Sıfırdan Kod Öğren",
  description:
    "Sıfırdan programlama öğren: Next.js, React, Python, Dart/Flutter rehberleri. İnteraktif alıştırmalar ve projelerle adım adım kodlama dersleri.",
  path: "/programlama",
  keywords: [
    "programlama öğren",
    "kodlama dersleri",
    "programlama rehberi",
    "next.js türkçe",
    "sıfırdan programlama",
    "web geliştirme dersleri",
  ],
});

// ─── Rehber verilerini grupla ────────────────────────────────

type GuideInfo = {
  guide: string;
  guideTitle: string;
  technology: string;
  totalChapters: number;
  publishedChapters: number;
  difficulty: string;
  latestDate: string;
};

function getGuides(): GuideInfo[] {
  const published = rehberler.filter((r) => r.published);
  const guideMap = new Map<string, GuideInfo>();

  for (const r of published) {
    const existing = guideMap.get(r.guide);
    if (!existing) {
      guideMap.set(r.guide, {
        guide: r.guide,
        guideTitle: r.guideTitle,
        technology: r.technology,
        totalChapters: r.totalChapters,
        publishedChapters: 1,
        difficulty: r.difficulty,
        latestDate: r.date,
      });
    } else {
      existing.publishedChapters += 1;
      if (new Date(r.date) > new Date(existing.latestDate)) {
        existing.latestDate = r.date;
      }
    }
  }

  return Array.from(guideMap.values()).sort(
    (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
  );
}

// ─── Ana Sayfa ───────────────────────────────────────────────

export default function ProgramlamaPage() {
  const guides = getGuides();

  const jsonLdData = [
    breadcrumbJsonLd([
      { name: "Ana Sayfa", href: "/" },
      { name: "Programlama", href: "/programlama" },
    ]),
    collectionPageJsonLd({
      name: "Programlama Rehberleri",
      description: "Sıfırdan programlama öğren — adım adım interaktif rehberler.",
      url: "/programlama",
      items: guides.map((g) => ({
        name: g.guideTitle,
        url: `/programlama/${g.guide}`,
        description: GUIDE_TECHNOLOGIES[g.technology]?.description ?? "",
      })),
      itemType: "Course",
    }),
  ];

  return (
    <>
      <JsonLd data={jsonLdData} />

      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Programlama", href: "/programlama" },
          ]}
        />

        <PageHeader
          title="Programlama Rehberleri"
          description="Sıfırdan kodlama öğren. İnteraktif alıştırmalar, gerçek projeler ve adım adım rehberlerle programlamaya başla."
        />

        {/* ─── Guide Cards — Feed Post Formatı ─── */}
        <div className="pt-4 space-y-6 sm:space-y-8">
          {guides.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-sm">Rehberler hazirlaniyor. Cok yakinda burada!</p>
            </div>
          ) : (
            guides.map((g, i) => {
              const tech = GUIDE_TECHNOLOGIES[g.technology];
              const progress = Math.round((g.publishedChapters / g.totalChapters) * 100);

              return (
                <div key={g.guide}>
                  {i > 0 && (
                    <div className="mx-auto w-12 h-px bg-white/[0.04] mb-6 sm:mb-8" />
                  )}
                  <TiltCard
                    className="rounded-xl overflow-hidden animate-fade-up"
                    style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}
                  >
                    <Link href={`/programlama/${g.guide}`} className="group block">
                      {/* Post header — teknoloji + tarih */}
                      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-cyan-400">{`</>`}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-300">{tech?.label ?? g.technology}</p>
                          <p className="text-[10px] text-gray-600">{formatDate(g.latestDate)}</p>
                        </div>
                        <span className="ml-auto text-[9px] font-sans tracking-widest uppercase text-cyan-400/50 border border-cyan-400/20 rounded-full px-2 py-0.5">
                          Rehber
                        </span>
                      </div>

                      {/* Gorsel alan — terminal tarzinda progress gosterimi */}
                      <div className="mx-4 sm:mx-5 rounded-lg bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04]">
                          <span className="w-2 h-2 rounded-full bg-red-500/40" />
                          <span className="w-2 h-2 rounded-full bg-yellow-500/40" />
                          <span className="w-2 h-2 rounded-full bg-green-500/40" />
                          <span className="ml-2 text-[9px] font-sans text-gray-700">ilerleme</span>
                        </div>
                        <div className="px-3 py-3 sm:px-4 sm:py-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-sans text-gray-600">{g.publishedChapters}/{g.totalChapters} bolum yayinda</span>
                            <span className="text-[10px] font-sans text-cyan-400/60">%{progress}</span>
                          </div>
                          <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500/60 to-cyan-400/40 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Post body — baslik + aciklama */}
                      <div className="px-4 pt-3.5 pb-2 sm:px-5">
                        <h3 className="text-[15px] sm:text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
                          {g.guideTitle}
                        </h3>
                        {tech && (
                          <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {tech.description}
                          </p>
                        )}
                      </div>

                      {/* Post footer */}
                      <div className="flex items-center justify-between px-4 pb-4 sm:px-5 sm:pb-5 pt-1">
                        <span className="text-[10px] font-sans text-gray-700">
                          Ucretsiz & Turkce
                        </span>
                        <span className="text-xs text-cyan-400/60 group-hover:text-cyan-400 transition-colors">
                          Rehbere basla &rarr;
                        </span>
                      </div>
                    </Link>
                  </TiltCard>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Coming Soon ─── */}
        {guides.length > 0 && (
          <>
            <div className="line-void my-12" />
            <div className="text-center animate-fade-up delay-300">
              <p className="text-sm text-gray-600">
                Yeni rehberler ekleniyor.{" "}
                <span className="text-primary-400">React</span>,{" "}
                <span className="text-primary-400">Python + AI</span> ve{" "}
                <span className="text-primary-400">Dart/Flutter</span> yakında.
              </p>
            </div>
          </>
        )}
      </section>
    </>
  );
}
