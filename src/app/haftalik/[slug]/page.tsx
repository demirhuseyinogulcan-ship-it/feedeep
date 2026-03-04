// ─────────────────────────────────────────────────────────────
// AI Rehber — Haftalık Brifing Detay (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { haftalik } from "#site/content";
import { generateMeta, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { MDXContent } from "@/components/content/mdx-content";
import { ActionItems } from "@/components/content/action-items";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const sortedBriefings = haftalik
  .filter((b) => b.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export async function generateStaticParams() {
  return sortedBriefings.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const briefing = sortedBriefings.find((b) => b.slug === slug);
  if (!briefing) return {};

  return generateMeta({
    title: briefing.title,
    description: briefing.description,
    path: `/haftalik/${slug}`,
    type: "article",
    publishedTime: briefing.date,
  });
}

export default async function HaftalikDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const currentIndex = sortedBriefings.findIndex((b) => b.slug === slug);
  const briefing = sortedBriefings[currentIndex];
  if (!briefing) notFound();

  const prev = sortedBriefings[currentIndex + 1]; // older
  const next = sortedBriefings[currentIndex - 1]; // newer

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Haftalık Brifing", href: "/haftalik" },
            { name: briefing.title, href: `/haftalik/${slug}` },
          ]),
          articleJsonLd({
            title: briefing.title,
            description: briefing.description,
            slug: slug,
            publishedTime: briefing.date,
            section: "Haftalık Brifing",
            wordCount: briefing.metadata.wordCount,
            readingTime: briefing.metadata.readingTime,
            urlPath: `/haftalik/${slug}`,
          }),
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Haftalık Brifing", href: "/haftalik" },
            { label: `#${briefing.weekNumber}`, href: `/haftalik/${slug}` },
          ]}
        />

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-100 mb-3">
            {briefing.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(briefing.date)}
            </span>
            <span className="text-gray-700">·</span>
            <span>
              {briefing.year} — Hafta #{briefing.weekNumber}
            </span>
          </div>
        </header>

        {/* Highlights Box */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Bu Haftanın Öne Çıkanları
          </h2>
          <ol className="space-y-3">
            {briefing.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-300"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/[0.08] text-gray-400 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <div>
                  <span className="font-medium text-gray-200">{h.title}</span>
                  <p className="text-gray-500 mt-0.5">{h.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="line-void mb-12" />

        {/* MDX İçerik */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={briefing.body} />
        </div>

        <div className="line-void my-12" />

        {/* Weekly Action */}
        <ActionItems items={[briefing.weeklyAction]} />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
          {prev ? (
            <Link
              href={`/haftalik/${prev.slug}`}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              #{prev.weekNumber}
            </Link>
          ) : (
            <Link
              href="/haftalik"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Tüm Brifinglere Dön
            </Link>
          )}
          {next ? (
            <Link
              href={`/haftalik/${next.slug}`}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              #{next.weekNumber}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-sm text-gray-700 cursor-not-allowed">
              Sonraki Brifing
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </article>
    </>
  );
}
