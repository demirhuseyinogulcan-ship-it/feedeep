// ─────────────────────────────────────────────────────────────
// AI Rehber — Yazı Detay Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { yazilar } from "#site/content";
import { generateMeta, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { YAZI_CATEGORIES } from "@/lib/constants";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ArticleHeader } from "@/components/shared/article-header";
import { MDXContent } from "@/components/content/mdx-content";
import { TrustBadge } from "@/components/content/trust-badge";
import { ActionItems } from "@/components/content/action-items";
import { RelatedArticles } from "@/components/content/related-articles";
import { CoverImage } from "@/components/content/cover-image";
import { ReadingTracker } from "@/components/shared/reading-tracker";
import { ShareButtons } from "@/components/shared/share-buttons";
import { SITE } from "@/lib/constants";

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
    publishedTime: post.date,
    modifiedTime: post.updated,
    keywords: post.keywords,
    image: post.image,
    section: YAZI_CATEGORIES[post.category] ?? post.category,
    tags: post.keywords,
  });
}

export default async function YaziDetayPage({ params }: Props) {
  const { slug } = await params;
  const post = yazilar.find((y) => y.slug === slug && y.published);
  if (!post) notFound();

  const categoryLabel = YAZI_CATEGORIES[post.category] ?? post.category;

  // İlgili yazılar: aynı kategori veya ortak keyword
  const related = yazilar
    .filter(
      (y) =>
        y.published &&
        y.slug !== post.slug &&
        (y.category === post.category ||
          y.keywords?.some((k) => post.keywords?.includes(k)))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((y) => ({
      slug: y.slug,
      title: y.title,
      description: y.description,
      date: y.date,
      category: y.category,
      categoryLabel: YAZI_CATEGORIES[y.category] ?? y.category,
      readingTime: y.metadata.readingTime,
      editorPick: y.editorPick,
    }));

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            title: post.title,
            description: post.description,
            slug: post.slug,
            publishedTime: post.date,
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
        ]}
      />

      <ReadingTracker title={post.title} />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
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
          slug={post.slug}
          contentType="yazi"
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

        {/* Karşı Görüş */}
        {post.counterpoint && (
          <aside className="mb-12 py-4 border-l-2 border-white/[0.06] pl-4 animate-fade-up delay-100">
            <p className="text-[11px] font-mono tracking-widest uppercase text-gray-600 mb-2">
              Karşı görüş
            </p>
            <p className="text-sm text-gray-400 leading-relaxed italic">
              {post.counterpoint}
            </p>
          </aside>
        )}

        {/* MDX İçerik */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={post.body} />
        </div>

        <div className="line-void my-12" />

        {/* Güven Katmanı & Aksiyon Öğeleri */}
        <footer className="space-y-8 animate-fade-up delay-300">
          <TrustBadge
            sources={post.sources}
            confidence={post.confidence}
            lastFactChecked={post.lastFactChecked}
            corrections={post.corrections}
          />

          {post.actionItems.length > 0 && (
            <ActionItems items={post.actionItems} />
          )}
        </footer>

        {/* İlgili Yazılar — SEO iç link ağı */}
        <RelatedArticles items={related} />
      </article>
    </>
  );
}
