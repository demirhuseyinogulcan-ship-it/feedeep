// ─────────────────────────────────────────────────────────────
// feedeep — Haber Detay Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { haberler, yazilar } from "#site/content";
import { generateMeta, newsArticleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { HABER_CATEGORIES } from "@/lib/constants";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ArticleHeader } from "@/components/shared/article-header";
import { MDXContent } from "@/components/content/mdx-content";
import { TrustBadge } from "@/components/content/trust-badge";
import { RelatedNews } from "@/components/content/related-news";
import { RelatedArticles } from "@/components/content/related-articles";
import { FaqSection } from "@/components/content/faq-section";
import { CoverImage } from "@/components/content/cover-image";
import { ReadingTracker } from "@/components/shared/reading-tracker";
import { ShareButtons } from "@/components/shared/share-buttons";
import { SignalBar } from "@/components/signals/signal-bar";
import { CommentSection } from "@/components/signals/comment-section";
import { ViewTracker } from "@/components/content/view-tracker";
import { TagLinks } from "@/components/content/tag-links";
import { SITE, YAZI_CATEGORIES } from "@/lib/constants";
import { getPublicationDate, sortContent } from "@/lib/content-order";
import { pickRelatedContent } from "@/lib/related-content";

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
    publishedTime: getPublicationDate(news),
    modifiedTime: news.updated,
    keywords: news.keywords,
    image: news.image,
    section: HABER_CATEGORIES[news.category] ?? news.category,
    tags: [...(news.tags ?? []), ...(news.keywords ?? [])],
  });
}

export default async function HaberDetayPage({ params }: Props) {
  const { slug } = await params;
  const news = haberler.find((h) => h.slug === slug && h.published);
  if (!news) notFound();

  const categoryLabel = HABER_CATEGORIES[news.category] ?? news.category;

  // İlgili haberler: aynı kategori veya ortak keyword
  const related = pickRelatedContent(news, haberler, { maxItems: 4 })
    .map((h) => ({
      slug: h.slug,
      title: h.title,
      description: h.description,
      date: h.date,
      category: h.category,
      categoryLabel: HABER_CATEGORIES[h.category] ?? h.category,
      editorPick: h.editorPick,
      image: h.image,
      imageAlt: h.imageAlt,
      blurDataURL: h.blurDataURL,
      sourceName: h.sourceName,
    }));

  // Cross-type: ilgili yazilar (ortak keyword)
  const relatedYazilar = pickRelatedContent(news, yazilar, {
    maxItems: 2,
    includeCategory: false,
  })
    .map((y) => ({
      slug: y.slug,
      title: y.title,
      description: y.description,
      date: y.date,
      category: y.category,
      categoryLabel: YAZI_CATEGORIES[y.category] ?? y.category,
      readingTime: y.metadata.readingTime,
      editorPick: y.editorPick,
      image: y.image,
      imageAlt: y.imageAlt,
      blurDataURL: y.blurDataURL,
    }));

  return (
    <>
      <JsonLd
        data={[
          newsArticleJsonLd({
            title: news.title,
            description: news.description,
            slug: news.slug,
            publishedTime: getPublicationDate(news),
            modifiedTime: news.updated,
            sourceUrl: news.sourceUrl,
            sourceName: news.sourceName,
            keywords: news.keywords,
            articleSection: categoryLabel,
            wordCount: news.metadata.wordCount,
            readingTime: news.metadata.readingTime,
            image: news.image,
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Haberler", href: "/haberler" },
            { name: news.title, href: `/haberler/${news.slug}` },
          ]),
          ...(news.faq.length > 0 ? [faqJsonLd(news.faq)] : []),
        ]}
      />

      <ReadingTracker title={news.title} />
      <ViewTracker articleId={`haber-${news.slug}`} />
      <article className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
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

        {news.image && (
          <CoverImage
            src={news.image}
            alt={news.imageAlt ?? news.title}
            credit={news.imageCredit}
            blurDataURL={news.blurDataURL}
          />
        )}

        <div className="line-void mb-8" />

        <ShareButtons
          title={news.title}
          url={`${SITE.url}/haberler/${news.slug}`}
          socialSnippet={news.socialSnippet}
        />

        <div className="line-void mb-12" />

        {/* MDX İçerik */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={news.body} />
        </div>

        <FaqSection items={news.faq} />

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
            <span className="text-[10px] font-sans tracking-widest uppercase text-gray-700 block mb-2">
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

        {/* Sinyal Çubuğu */}
        <div className="my-10 animate-fade-up delay-300">
          <SignalBar articleId={`haber-${news.slug}`} size="lg" />
        </div>

        {/* Görüşler */}
        <div className="my-10 animate-fade-up delay-300">
          <CommentSection articleId={`haber-${news.slug}`} />
        </div>

        {/* Etiket Linkleri — Hub sayfalarina ic link */}
        <TagLinks tags={news.tags ?? []} />

        {/* İlgili Haberler — SEO iç link ağı */}
        <RelatedNews items={related} />

        {/* Cross-type: İlgili Yazılar */}
        {relatedYazilar.length > 0 && (
          <RelatedArticles items={relatedYazilar} />
        )}
      </article>
    </>
  );
}
