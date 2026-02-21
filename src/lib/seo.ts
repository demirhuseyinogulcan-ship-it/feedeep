// ─────────────────────────────────────────────────────────────
// AI Rehber — SEO Helpers (JSON-LD, Meta, Structured Data)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { SITE } from "./constants";

type SEOParams = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "article" | "website";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
  /** OG article:section (kategori) */
  section?: string;
  /** OG article:tag (etiketler) */
  tags?: string[];
};

/** Next.js metadata üretici — her sayfa için DRY */
export function generateMeta({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  keywords,
  noIndex = false,
  section,
  tags,
}: SEOParams): Metadata {
  const url = `${SITE.url}${path}`;
  const ogImage = image ?? `${SITE.url}/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: type === "article" ? "article" : "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(type === "article" && { authors: [SITE.author.name] }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** WebSite JSON-LD — ana sayfa */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: organizationJsonLd(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/arama?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Organization JSON-LD */
export function organizationJsonLd() {
  return {
    "@type": "Organization",
    name: SITE.organization.name,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}${SITE.organization.logo}`,
    },
    sameAs: [SITE.author.linkedin, SITE.author.instagram],
  };
}

/** Article JSON-LD — yazı detay sayfası */
export function articleJsonLd(params: {
  title: string;
  description: string;
  slug: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  keywords?: string[];
  section?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: `${SITE.url}/yazilar/${params.slug}`,
    image: params.image ?? `${SITE.url}/api/og?title=${encodeURIComponent(params.title)}`,
    datePublished: params.publishedTime,
    dateModified: params.modifiedTime ?? params.publishedTime,
    author: {
      "@type": "Person",
      name: SITE.author.name,
      url: SITE.author.linkedin,
    },
    publisher: organizationJsonLd(),
    inLanguage: SITE.language,
    ...(params.keywords && { keywords: params.keywords.join(", ") }),
    ...(params.section && { articleSection: params.section }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/yazilar/${params.slug}`,
    },
  };
}

/** NewsArticle JSON-LD — haber detay sayfası */
export function newsArticleJsonLd(params: {
  title: string;
  description: string;
  slug: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  sourceUrl?: string;
  sourceName?: string;
  keywords?: string[];
  articleSection?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: params.title,
    description: params.description,
    url: `${SITE.url}/haberler/${params.slug}`,
    image: params.image ?? `${SITE.url}/api/og?title=${encodeURIComponent(params.title)}`,
    datePublished: params.publishedTime,
    dateModified: params.modifiedTime ?? params.publishedTime,
    author: {
      "@type": "Person",
      name: SITE.author.name,
      url: SITE.author.linkedin,
    },
    publisher: organizationJsonLd(),
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/haberler/${params.slug}`,
    },
    ...(params.keywords && { keywords: params.keywords.join(", ") }),
    ...(params.articleSection && { articleSection: params.articleSection }),
    ...(params.sourceUrl && {
      citation: {
        "@type": "WebPage",
        url: params.sourceUrl,
        name: params.sourceName,
      },
    }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article [data-description]"],
    },
  };
}

/** BreadcrumbList JSON-LD */
export function breadcrumbJsonLd(
  items: Array<{ name: string; href: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.href}`,
    })),
  };
}

/** FAQ JSON-LD */
export function faqJsonLd(
  questions: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/** HowTo JSON-LD — rehber yazıları için */
export function howToJsonLd(params: {
  title: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: params.title,
    description: params.description,
    ...(params.totalTime && { totalTime: params.totalTime }),
    step: params.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
