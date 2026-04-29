// ─────────────────────────────────────────────────────────────
// feedeep — Yazı Detay Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { yazilar, haberler } from "#site/content";
import { generateMeta, articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { YAZI_CATEGORIES, HABER_CATEGORIES } from "@/lib/constants";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ArticleHeader } from "@/components/shared/article-header";
import { MDXContent } from "@/components/content/mdx-content";
import { TrustBadge } from "@/components/content/trust-badge";
import { RelatedArticles } from "@/components/content/related-articles";
import { RelatedNews } from "@/components/content/related-news";
import { TagLinks } from "@/components/content/tag-links";
import { FaqSection } from "@/components/content/faq-section";
import { CoverImage } from "@/components/content/cover-image";
import { ReadingTracker } from "@/components/shared/reading-tracker";
import { ShareButtons } from "@/components/shared/share-buttons";
import { SignalBar } from "@/components/signals/signal-bar";
import { CommentSection } from "@/components/signals/comment-section";
import { ViewTracker } from "@/components/content/view-tracker";
import { SITE } from "@/lib/constants";
import { getPublicationDate, sortContent } from "@/lib/content-order";
import { pickRelatedContent } from "@/lib/related-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return yazilar
    .filter((y) => y.published)
    .map((y) => ({ slug: y.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = yazilar.find((y) => y.slug === slug && y.published);
  if (!post) return {};

  return generateMeta({
    title: post.title,
    description: post.description,
    path: `/yazilar/${post.slug}`,
    type: "article",
    publishedTime: getPublicationDate(post),
    modifiedTime: post.updated,
    keywords: post.keywords,
    image: post.image,
    section: YAZI_CATEGORIES[post.category] ?? post.category,
    tags: [...(post.tags ?? []), ...(post.keywords ?? [])],
  });
}

export default async function YaziDetayPage({ params }: Props) {
  const { slug } = await params;
  const post = yazilar.find((y) => y.slug === slug && y.published);
  if (!post) notFound();

  const categoryLabel = YAZI_CATEGORIES[post.category] ?? post.category;

  // İlgili yazılar: aynı kategori veya ortak keyword
  const related = pickRelatedContent(post, yazilar, { maxItems: 4 })
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

  // Cross-type: ilgili haberler (ortak keyword)
  const relatedHaberler = pickRelatedContent(post, haberler, {
    maxItems: 2,
    includeCategory: false,
  })
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

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            title: post.title,
            description: post.description,
            slug: post.slug,
            publishedTime: getPublicationDate(post),
            modifiedTime: post.updated,
            keywords: post.keywords,
            section: categoryLabel,
            image: post.image,
            wordCount: post.metadata.wordCount,
            readingTime: post.metadata.readingTime,
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Yazılar", href: "/yazilar" },
            { name: post.title, href: `/yazilar/${post.slug}` },
          ]),
          ...(post.faq.length > 0 ? [faqJsonLd(post.faq)] : []),
        ]}
      />

      <ReadingTracker title={post.title} />
      <ViewTracker articleId={`yazi-${post.slug}`} />
      <article className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Yazılar", href: "/yazilar" },
            { label: post.title, href: `/yazilar/${post.slug}` },
          ]}
        />

        <ArticleHeader
          title={post.title}
          description={post.description}
          categoryLabel={categoryLabel}
          date={post.date}
          updated={post.updated}
          readingTime={post.metadata.readingTime}
        />

        {post.image && (
          <CoverImage
            src={post.image}
            alt={post.imageAlt ?? post.title}
            credit={post.imageCredit}
            blurDataURL={post.blurDataURL}
          />
        )}

        <div className="line-void mb-8" />

        <ShareButtons
          title={post.title}
          url={`${SITE.url}/yazilar/${post.slug}`}
          socialSnippet={post.socialSnippet}
        />

        <div className="line-void mb-12" />

        {/* MDX İçerik */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={post.body} />
        </div>

        <FaqSection items={post.faq} />

        <div className="line-void my-12" />

        {/* Güven Katmanı */}
        <footer className="space-y-8 animate-fade-up delay-300">
          <TrustBadge
            sources={post.sources}
            confidence={post.confidence}
            lastFactChecked={post.lastFactChecked}
            corrections={post.corrections}
          />
        </footer>

        {/* Sinyal Çubuğu */}
        <div className="my-10 animate-fade-up delay-300">
          <SignalBar articleId={`yazi-${post.slug}`} size="lg" />
        </div>

        {/* Görüşler */}
        <div className="my-10 animate-fade-up delay-300">
          <CommentSection articleId={`yazi-${post.slug}`} />
        </div>

        {/* Etiket Linkleri — Hub sayfalarina ic link */}
        <TagLinks tags={post.tags ?? []} />

        {/* İlgili Yazılar — SEO iç link ağı */}
        <RelatedArticles items={related} />

        {/* Cross-type: İlgili Haberler */}
        {relatedHaberler.length > 0 && (
          <RelatedNews items={relatedHaberler} />
        )}
      </article>
    </>
  );
}
