// ─────────────────────────────────────────────────────────────
// AI Rehber — Rehber Bölüm Sayfası (/programlama/[rehber]/[slug])
// Tekil ders/bölüm sayfası — MDX + interaktif componentler
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rehberler } from "#site/content";
import { generateMeta, breadcrumbJsonLd, learningResourceJsonLd, rehberFaqJsonLd } from "@/lib/seo";
import { GUIDE_TECHNOLOGIES } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { MDXContent } from "@/components/content/mdx-content";
import { ChapterNav } from "@/components/content/chapter-nav";
import { InteractiveQuiz } from "@/components/interactive/quiz";
import { CodeDetective } from "@/components/interactive/code-detective";
import { CodeFillBlank } from "@/components/interactive/code-fill-blank";
import { ChevronLeft, Clock, BookOpen, GraduationCap, ArrowRight } from "lucide-react";

// ─── Static Params ────────────────────────────────────────────

export function generateStaticParams() {
  return rehberler
    .filter((r) => r.published)
    .map((r) => ({
      rehber: r.guide,
      slug: r.slug,
    }));
}

// ─── Metadata ─────────────────────────────────────────────────

type PageProps = { params: Promise<{ rehber: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { rehber, slug } = await params;
  const chapter = rehberler.find(
    (r) => r.guide === rehber && r.slug === slug && r.published
  );
  if (!chapter) return {};

  const tech = GUIDE_TECHNOLOGIES[chapter.technology];

  return generateMeta({
    title: `${chapter.title} — ${chapter.guideTitle} Bölüm ${chapter.chapter}`,
    description: chapter.description,
    path: `/programlama/${rehber}/${slug}`,
    type: "article",
    publishedTime: chapter.date,
    modifiedTime: chapter.updated,
    keywords: chapter.keywords,
    section: tech?.label ?? chapter.technology,
  });
}

// ─── Sayfa ────────────────────────────────────────────────────

export default async function ChapterPage({ params }: PageProps) {
  const { rehber, slug } = await params;

  const chapter = rehberler.find(
    (r) => r.guide === rehber && r.slug === slug && r.published
  );
  if (!chapter) notFound();

  // Aynı rehberdeki diğer bölümler
  const siblings = rehberler
    .filter((r) => r.guide === rehber && r.published)
    .sort((a, b) => a.chapter - b.chapter);

  const currentIndex = siblings.findIndex((s) => s.slug === slug);
  const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const difficultyMap: Record<string, string> = {
    baslangic: "beginner",
    orta: "intermediate",
    ileri: "advanced",
  };

  const jsonLdData = [
    breadcrumbJsonLd([
      { name: "Ana Sayfa", href: "/" },
      { name: "Programlama", href: "/programlama" },
      { name: chapter.guideTitle, href: `/programlama/${rehber}` },
      { name: `Bölüm ${chapter.chapter}`, href: `/programlama/${rehber}/${slug}` },
    ]),
    learningResourceJsonLd({
      name: chapter.title,
      description: chapter.description,
      url: `/programlama/${rehber}/${slug}`,
      datePublished: chapter.date,
      dateModified: chapter.updated,
      keywords: chapter.keywords,
      educationalLevel: difficultyMap[chapter.difficulty] ?? "beginner",
      timeRequired: `PT${chapter.estimatedMinutes ?? 15}M`,
      isPartOf: {
        name: chapter.guideTitle,
        url: `/programlama/${rehber}`,
      },
    }),
    // FAQ JSON-LD — Google featured snippet için
    ...(chapter.faq && chapter.faq.length > 0
      ? [rehberFaqJsonLd(chapter.faq)]
      : []),
  ];

  // MDX componentleri — MDX dosyaları içinden <InteractiveQuiz /> vb. kullanılabilir
  const mdxComponents = {
    InteractiveQuiz,
    CodeDetective,
    CodeFillBlank,
  };

  return (
    <>
      <JsonLd data={jsonLdData} />

      <article className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        {/* ─── Breadcrumb ─── */}
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Programlama", href: "/programlama" },
            { label: chapter.guideTitle, href: `/programlama/${rehber}` },
            { label: `Bölüm ${chapter.chapter}`, href: `/programlama/${rehber}/${slug}` },
          ]}
        />

        {/* ─── Back Link ─── */}
        <Link
          href={`/programlama/${rehber}`}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary-400 transition-colors mb-6"
        >
          <ChevronLeft className="h-3 w-3" />
          Tüm Bölümler
        </Link>

        {/* ─── Header ─── */}
        <header className="mb-10 animate-fade-up">
          {/* Chapter badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
              {chapter.guideTitle} — Bölüm {chapter.chapter}/{chapter.totalChapters}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight mb-3">
            {chapter.title}
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            {chapter.description}
          </p>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            {chapter.estimatedMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{chapter.estimatedMinutes} dk okuma</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>
                {{
                  baslangic: "Başlangıç",
                  orta: "Orta",
                  ileri: "İleri",
                }[chapter.difficulty] ?? "Başlangıç"}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500/60 rounded-full transition-all"
                style={{
                  width: `${Math.round((chapter.chapter / chapter.totalChapters) * 100)}%`,
                }}
              />
            </div>
          </div>
        </header>

        {/* ─── Learning Outcomes ─── */}
        {chapter.learningOutcomes.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-10 animate-fade-up delay-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Bu bölümde öğreneceklerin
            </span>
            <ul className="mt-3 space-y-1.5">
              {chapter.learningOutcomes.map((outcome, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-500"
                >
                  <span className="text-gray-600 mt-0.5">•</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ─── Prerequisites ─── */}
        {chapter.prerequisites.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-10 animate-fade-up delay-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Ön Gereksinimler
            </span>
            <ul className="mt-2 space-y-1">
              {chapter.prerequisites.map((req, i) => (
                <li key={i} className="text-sm text-gray-500">
                  • {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="line-void mb-10" />

        {/* ─── MDX Content ─── */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={chapter.body} components={mdxComponents} />
        </div>

        <div className="line-void my-10" />

        {/* ─── Chapter Navigation ─── */}
        <ChapterNav
          guide={rehber}
          guideTitle={chapter.guideTitle}
          currentChapter={chapter.chapter}
          totalChapters={chapter.totalChapters}
          prev={prev ? { slug: prev.slug, title: prev.title, chapter: prev.chapter } : null}
          next={next ? { slug: next.slug, title: next.title, chapter: next.chapter } : null}
        />

        {/* ─── Sıkça Sorulan Sorular (FAQ) ─── */}
        {chapter.faq && chapter.faq.length > 0 && (
          <>
            <div className="line-void my-10" />
            <section className="animate-fade-up">
              <h2 className="text-lg font-bold text-gray-100 tracking-tight mb-6">
                Sıkça Sorulan Sorular
              </h2>
              <div className="space-y-3">
                {chapter.faq.map((item: { question: string; answer: string }, i: number) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-300 cursor-pointer select-none hover:text-gray-100 transition-colors">
                      <span>{item.question}</span>
                      <span className="ml-3 text-gray-600 group-open:rotate-45 transition-transform text-lg leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ─── Bu Rehberdeki Diğer Bölümler (İç Bağlantı Bloğu) ─── */}
        {siblings.length > 1 && (
          <>
            <div className="line-void my-10" />
            <section className="animate-fade-up">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-100 tracking-tight">
                  Bu Rehberdeki Bölümler
                </h2>
                <Link
                  href={`/programlama/${rehber}`}
                  className="text-xs text-gray-600 hover:text-primary-400 transition-colors"
                >
                  Tümünü gör
                </Link>
              </div>
              <div className="space-y-1">
                {siblings.map((s) => {
                  const isCurrent = s.slug === slug;
                  return (
                    <Link
                      key={s.slug}
                      href={`/programlama/${rehber}/${s.slug}`}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${
                        isCurrent
                          ? "border-primary-500/20 bg-primary-500/[0.04]"
                          : "border-transparent hover:border-white/[0.04] hover:bg-surface-2"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                          isCurrent
                            ? "bg-primary-500/20 text-primary-400"
                            : "bg-white/[0.04] text-gray-600"
                        }`}
                      >
                        {s.chapter}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          isCurrent
                            ? "text-primary-400 font-medium"
                            : "text-gray-400 group-hover:text-gray-200"
                        }`}
                      >
                        {s.title}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-[10px] font-mono text-primary-400/60">
                          Şu an buradasın
                        </span>
                      )}
                      {!isCurrent && s.estimatedMinutes && (
                        <span className="ml-auto text-[10px] font-mono text-gray-700">
                          {s.estimatedMinutes} dk
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* ─── Pillar Page CTA ─── */}
        <div className="line-void my-10" />
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center animate-fade-up">
          <p className="text-sm text-gray-500 mb-3">
            {chapter.guideTitle} rehberinin tüm bölümlerine göz at
          </p>
          <Link
            href={`/programlama/${rehber}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            {chapter.guideTitle} — Tüm Bölümler
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </>
  );
}
