// ─────────────────────────────────────────────────────────────
// AI Rehber — Rehber Bölüm Sayfası (/programlama/[rehber]/[slug])
// Tekil ders/bölüm sayfası — MDX + interaktif componentler
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rehberler } from "#site/content";
import { generateMeta, breadcrumbJsonLd, learningResourceJsonLd } from "@/lib/seo";
import { GUIDE_TECHNOLOGIES } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { MDXContent } from "@/components/content/mdx-content";
import { ChapterNav } from "@/components/content/chapter-nav";
import { InteractiveQuiz } from "@/components/interactive/quiz";
import { CodeDetective } from "@/components/interactive/code-detective";
import { CodeFillBlank } from "@/components/interactive/code-fill-blank";
import { ChevronLeft, Clock, BookOpen, GraduationCap } from "lucide-react";

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

  const tech = GUIDE_TECHNOLOGIES[chapter.technology];

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

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
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
            {tech && (
              <span className={`text-sm ${tech.color}`}>{tech.icon}</span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary-400">
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
          <div className="rounded-xl border border-primary-500/10 bg-primary-500/[0.03] p-5 mb-10 animate-fade-up delay-100">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-semibold text-primary-400">
                Bu bölümde öğreneceklerin
              </span>
            </div>
            <ul className="space-y-1.5">
              {chapter.learningOutcomes.map((outcome, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-400"
                >
                  <span className="text-primary-500 mt-0.5">✓</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ─── Prerequisites ─── */}
        {chapter.prerequisites.length > 0 && (
          <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/[0.03] p-5 mb-10 animate-fade-up delay-100">
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
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
      </article>
    </>
  );
}
