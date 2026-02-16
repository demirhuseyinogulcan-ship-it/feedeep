// ─────────────────────────────────────────────────────────────
// AI Rehber — Haber Detay Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { haberler } from "#site/content";
import { generateMeta, newsArticleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { HABER_CATEGORIES } from "@/lib/constants";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ArticleHeader } from "@/components/shared/article-header";
import { MDXContent } from "@/components/content/mdx-content";
import { TrustBadge } from "@/components/content/trust-badge";
import { ReadingTracker } from "@/components/shared/reading-tracker";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return haberler
    .filter((h) => h.published)
    .map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = haberler.find((h) => h.slug === slug && h.published);
  if (!news) return {};

  return generateMeta({
    title: news.title,
    description: news.description,
    path: `/haberler/${news.slug}`,
    type: "article",
    publishedTime: news.date,
    modifiedTime: news.updated,
    keywords: news.keywords,
  });
}

export default async function HaberDetayPage({ params }: Props) {
  const { slug } = await params;
  const news = haberler.find((h) => h.slug === slug && h.published);
  if (!news) notFound();

  const categoryLabel = HABER_CATEGORIES[news.category] ?? news.category;

  return (
    <>
      <JsonLd
        data={[
          newsArticleJsonLd({
            title: news.title,
            description: news.description,
            slug: news.slug,
            publishedTime: news.date,
            modifiedTime: news.updated,
            sourceUrl: news.sourceUrl,
            sourceName: news.sourceName,
            keywords: news.keywords,
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Haberler", href: "/haberler" },
            { name: news.title, href: `/haberler/${news.slug}` },
          ]),
        ]}
      />

      <ReadingTracker title={news.title} />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Haberler", href: "/haberler" },
            { label: news.title, href: `/haberler/${news.slug}` },
          ]}
        />

        <ArticleHeader
          title={news.title}
          description={news.description}
          categoryLabel={categoryLabel}
          date={news.date}
          updated={news.updated}
          sourceName={news.sourceName}
          readingTime={news.metadata.readingTime}
        />

        <div className="line-void mb-12" />

        {/* MDX İçerik */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={news.body} />
        </div>

        <div className="line-void my-12" />

        {/* Güven Katmanı */}
        <footer className="space-y-8 animate-fade-up delay-300">
          <TrustBadge
            sources={news.sources}
            confidence={news.confidence}
            lastFactChecked={news.date}
          />

          {/* Kaynak Link */}
          <div className="pt-4 border-t border-white/[0.04]">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-2">
              Orijinal Kaynak
            </span>
            <a
              href={news.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              {news.sourceName}
            </a>
          </div>
        </footer>
      </article>
    </>
  );
}
