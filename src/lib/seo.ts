// ─────────────────────────────────────────────────────────────
// AI Rehber — SEO Helpers (JSON-LD, Meta, Structured Data)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { SITE } from "./constants";

type SEOParams = {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  canonicalUrl?: string;
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
  canonicalPath,
  canonicalUrl,
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
  const canonical = canonicalUrl
    ? canonicalUrl.startsWith("http")
      ? canonicalUrl
      : `${SITE.url}${canonicalUrl}`
    : `${SITE.url}${canonicalPath ?? path}`;
  const ogImage = image ?? `${SITE.url}/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
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
    email: SITE.author.email,
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
  wordCount?: number;
  readingTime?: number;
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
    isAccessibleForFree: true,
    ...(params.wordCount && { wordCount: params.wordCount }),
    ...(params.readingTime && { timeRequired: `PT${params.readingTime}M` }),
    ...(params.keywords && { keywords: params.keywords.join(", ") }),
    ...(params.section && { articleSection: params.section }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/yazilar/${params.slug}`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article [data-description]"],
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
  wordCount?: number;
  readingTime?: number;
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
    ...(params.wordCount && { wordCount: params.wordCount }),
    ...(params.readingTime && { timeRequired: `PT${params.readingTime}M` }),
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

/** ItemList JSON-LD — koleksiyon/liste sayfaları için (Rich Snippet) */
export function itemListJsonLd(params: {
  name: string;
  description: string;
  items: Array<{ name: string; url: string; position?: number }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: params.name,
    description: params.description,
    numberOfItems: params.items.length,
    itemListElement: params.items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}

/** CollectionPage JSON-LD — Prompt Kütüphanesi gibi toplama sayfaları */
export function collectionPageJsonLd(params: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string; description: string }>;
  itemType?: string;
}) {
  const resolvedType = params.itemType ?? "HowTo";
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: params.url.startsWith("http") ? params.url : `${SITE.url}${params.url}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: params.items.length,
      itemListElement: params.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": resolvedType,
          name: item.name,
          description: item.description,
          url: item.url.startsWith("http") ? item.url : `${SITE.url}${item.url}`,
        },
      })),
    },
  };
}

/** Course JSON-LD — Programlama rehberleri için */
export function courseJsonLd(params: {
  name: string;
  description: string;
  url: string;
  provider?: string;
  language?: string;
  chapters: Array<{ name: string; url: string; position: number }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.name,
    description: params.description,
    url: params.url.startsWith("http") ? params.url : `${SITE.url}${params.url}`,
    provider: {
      "@type": "Organization",
      name: params.provider ?? SITE.name,
      url: SITE.url,
    },
    inLanguage: params.language ?? "tr",
    isAccessibleForFree: true,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${params.chapters.length * 15}M`,
    },
    syllabusSections: params.chapters.map((ch) => ({
      "@type": "Syllabus",
      name: ch.name,
      url: ch.url.startsWith("http") ? ch.url : `${SITE.url}${ch.url}`,
      position: ch.position,
    })),
  };
}

/** LearningResource JSON-LD — Tekil ders/bölüm sayfaları */
export function learningResourceJsonLd(params: {
  name: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  learningResourceType?: string;
  educationalLevel?: string;
  timeRequired?: string;
  isPartOf?: { name: string; url: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: params.name,
    description: params.description,
    url: params.url.startsWith("http") ? params.url : `${SITE.url}${params.url}`,
    author: {
      "@type": "Person",
      name: SITE.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    inLanguage: "tr",
    isAccessibleForFree: true,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    keywords: params.keywords?.join(", "),
    learningResourceType: params.learningResourceType ?? "tutorial",
    educationalLevel: params.educationalLevel ?? "beginner",
    timeRequired: params.timeRequired ?? "PT15M",
    ...(params.isPartOf && {
      isPartOf: {
        "@type": "Course",
        name: params.isPartOf.name,
        url: params.isPartOf.url.startsWith("http")
          ? params.isPartOf.url
          : `${SITE.url}${params.isPartOf.url}`,
      },
    }),
  };
}
