// ─────────────────────────────────────────────────────────────
// AI Rehber — Rehber Genel Bakış Sayfası (/programlama/[rehber])
// Pillar page — tüm bölümlerin listelendiği rehber ana sayfası
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rehberler } from "#site/content";
import { generateMeta, breadcrumbJsonLd, courseJsonLd } from "@/lib/seo";
import { GUIDE_TECHNOLOGIES, SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { CheckCircle2, Lock, Clock, GraduationCap, BookOpen } from "lucide-react";

// ─── generateStaticParams ─────────────────────────────────────

export function generateStaticParams() {
  const guides = new Set(rehberler.filter((r) => r.published).map((r) => r.guide));
  return Array.from(guides).map((guide) => ({ rehber: guide }));
}

// ─── Metadata ─────────────────────────────────────────────────

type PageProps = { params: Promise<{ rehber: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { rehber } = await params;
  const chapters = rehberler
    .filter((r) => r.guide === rehber && r.published)
    .sort((a, b) => a.chapter - b.chapter);

  if (chapters.length === 0) return {};

  const first = chapters[0];
  const tech = GUIDE_TECHNOLOGIES[first.technology];

  return generateMeta({
    title: `${first.guideTitle} — Sıfırdan ${tech?.label ?? first.technology} Dersleri`,
    description: `${first.guideTitle}: ${first.totalChapters} bölümlük ücretsiz Türkçe ${tech?.label ?? first.technology} rehberi. İnteraktif alıştırmalar ve projelerle adım adım öğren.`,
    path: `/programlama/${rehber}`,
    keywords: [
      `${tech?.label?.toLowerCase() ?? first.technology} dersleri`,
      `${tech?.label?.toLowerCase() ?? first.technology} türkçe`,
      `sıfırdan ${tech?.label?.toLowerCase() ?? first.technology}`,
      "programlama öğren",
      "kodlama dersleri",
      `${tech?.label?.toLowerCase() ?? first.technology} rehberi`,
    ],
  });
}

// ─── Difficulty helpers ──────────────────────────────────────

const difficultyConfig: Record<string, { label: string; cls: string }> = {
  baslangic: { label: "Başlangıç", cls: "bg-green-500/10 text-green-400 border-green-500/20" },
  orta: { label: "Orta", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  ileri: { label: "İleri", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

// ─── Sayfa ────────────────────────────────────────────────────

export default async function RehberOverviewPage({ params }: PageProps) {
  const { rehber } = await params;

  const chapters = rehberler
    .filter((r) => r.guide === rehber && r.published)
    .sort((a, b) => a.chapter - b.chapter);

  if (chapters.length === 0) notFound();

  const first = chapters[0];
  const tech = GUIDE_TECHNOLOGIES[first.technology];
  const totalTime = chapters.reduce((sum, c) => sum + (c.estimatedMinutes ?? 15), 0);

  const jsonLdData = [
    breadcrumbJsonLd([
      { name: "Ana Sayfa", href: "/" },
      { name: "Programlama", href: "/programlama" },
      { name: first.guideTitle, href: `/programlama/${rehber}` },
    ]),
    courseJsonLd({
      name: first.guideTitle,
      description: `${first.guideTitle}: ${first.totalChapters} bölümlük ücretsiz Türkçe rehber.`,
      url: `/programlama/${rehber}`,
      chapters: chapters.map((c) => ({
        name: `Bölüm ${c.chapter}: ${c.title}`,
        url: `/programlama/${rehber}/${c.slug}`,
        position: c.chapter,
      })),
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
            { label: first.guideTitle, href: `/programlama/${rehber}` },
          ]}
        />

        {/* ─── Hero ─── */}
        <div className="mb-12 animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            {tech && (
              <span className={`text-2xl ${tech.color}`}>{tech.icon}</span>
            )}
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${difficultyConfig[first.difficulty]?.cls ?? ""}`}>
              {difficultyConfig[first.difficulty]?.label ?? "Başlangıç"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 tracking-tight mb-3">
            {first.guideTitle}
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-6">
            {first.totalChapters} bölümlük kapsamlı rehber. İnteraktif alıştırmalar ve
            gerçek projelerle {tech?.label ?? first.technology} öğren.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-5 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{chapters.length}/{first.totalChapters} bölüm yayında</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>~{totalTime} dakika</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>Ücretsiz</span>
            </div>
          </div>
        </div>

        {/* ─── Progress ─── */}
        <div className="mb-8 animate-fade-up delay-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-600">İlerleme</span>
            <span className="text-xs font-mono text-gray-600">
              {chapters.length}/{first.totalChapters}
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
              style={{ width: `${Math.round((chapters.length / first.totalChapters) * 100)}%` }}
            />
          </div>
        </div>

        {/* ─── Bölümler Listesi ─── */}
        <div className="space-y-1 animate-fade-up delay-200">
          {Array.from({ length: first.totalChapters }, (_, i) => {
            const chapter = chapters.find((c) => c.chapter === i + 1);
            const isPublished = !!chapter;

            return (
              <div key={i}>
                {isPublished ? (
                  <Link
                    href={`/programlama/${rehber}/${chapter.slug}`}
                    className="group flex items-center gap-4 px-4 py-4 rounded-lg transition-all hover:bg-surface-2 border border-transparent hover:border-white/[0.04]"
                  >
                    {/* Chapter number */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold shrink-0">
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-primary-400 transition-colors truncate">
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {chapter.description}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 shrink-0">
                      {chapter.estimatedMinutes && (
                        <span className="text-[10px] font-mono text-gray-600">
                          {chapter.estimatedMinutes} dk
                        </span>
                      )}
                      <CheckCircle2 className="h-4 w-4 text-green-500/40" />
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 px-4 py-4 rounded-lg opacity-40 cursor-not-allowed">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] text-gray-700 text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-600">
                        Bölüm {i + 1} — Yakında
                      </h3>
                    </div>
                    <Lock className="h-4 w-4 text-gray-700 shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── CTA ─── */}
        {chapters.length > 0 && (
          <>
            <div className="line-void my-10" />
            <div className="text-center animate-fade-up delay-300">
              <Link
                href={`/programlama/${rehber}/${chapters[0].slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-400 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Rehbere Başla
              </Link>
              <p className="text-xs text-gray-600 mt-3">
                Hesap gerektirmez. Hemen okumaya başla.
              </p>
            </div>
          </>
        )}
      </section>
    </>
  );
}
