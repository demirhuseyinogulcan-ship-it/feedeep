// ─────────────────────────────────────────────────────────────
// AI Rehber — Programlama Ana Sayfası (/programlama)
// Tüm rehberlerin listelendiği pillar hub sayfası
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { rehberler } from "#site/content";
import { generateMeta, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { GUIDE_TECHNOLOGIES } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { BookOpen, Clock, ChevronRight, GraduationCap } from "lucide-react";

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

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
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

        {/* ─── Hero Stats ─── */}
        <div className="flex flex-wrap gap-6 mb-12 animate-fade-up delay-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen className="h-4 w-4" />
            <span>{guides.length} rehber</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <GraduationCap className="h-4 w-4" />
            <span>{rehberler.filter((r) => r.published).length} bölüm</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Ücretsiz & Türkçe</span>
          </div>
        </div>

        {/* ─── Guide Cards ─── */}
        <div className="space-y-4 animate-fade-up delay-200">
          {guides.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-sm">Rehberler hazırlanıyor. Çok yakında burada!</p>
            </div>
          ) : (
            guides.map((g) => {
              const tech = GUIDE_TECHNOLOGIES[g.technology];
              const progress = Math.round((g.publishedChapters / g.totalChapters) * 100);

              return (
                <Link
                  key={g.guide}
                  href={`/programlama/${g.guide}`}
                  className="group block rounded-xl border border-white/[0.04] bg-surface-1 p-6 transition-all hover:border-primary-500/20 hover:bg-surface-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-100 group-hover:text-primary-400 transition-colors mb-1">
                        {g.guideTitle}
                      </h2>

                      {/* Description */}
                      {tech && (
                        <p className="text-sm text-gray-500 mb-4">{tech.description}</p>
                      )}

                      {/* Progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500/60 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gray-600 whitespace-nowrap">
                          {g.publishedChapters}/{g.totalChapters} bölüm
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-primary-400 transition-colors mt-1 shrink-0" />
                  </div>
                </Link>
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
