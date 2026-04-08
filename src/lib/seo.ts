// ─────────────────────────────────────────────────────────────
// feedeep — SEO Helpers (JSON-LD, Meta, Structured Data)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { SITE } from "./constants";
import type { JsonLdObject } from "./schemas/json-ld.types";

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
  const canonical = canonicalUrl
    ? canonicalUrl.startsWith("http")
      ? canonicalUrl
      : `${SITE.url}${canonicalUrl}`
    : `${SITE.url}${canonicalPath ?? path}`;
  const ogParams = new URLSearchParams({ title });
  if (section) ogParams.set("category", section);
  if (publishedTime) ogParams.set("date", publishedTime.slice(0, 10));
  const ogImage = image
    ? image.startsWith("http") ? image : `${SITE.url}${image}`
    : `${SITE.url}/api/og?${ogParams.toString()}`;

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
      site: "@feedeepcom",
      creator: "@feedeepcom",
    },
  };
}

/** WebSite JSON-LD — ana sayfa */
export function websiteJsonLd(): JsonLdObject {
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
export function organizationJsonLd(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.organization.name,
    url: SITE.url,
    email: SITE.author.email,
    description:
      "Yapay zeka, yazilim ve web gelistirme dunyasindan guncel haberler, derinlemesine analizler ve arac incelemeleri.",
    foundingDate: SITE.foundingDate,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}${SITE.organization.logo}`,
      width: 512,
      height: 512,
    },
    sameAs: [SITE.author.instagram].filter(Boolean),
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
    knowsAbout: [
      "Yapay Zeka",
      "Makine Ogrenmesi",
      "Buyuk Dil Modelleri",
      "Yazilim Gelistirme",
      "Web Gelistirme",
      "Kodlama",
      "Siber Guvenlik",
      "ChatGPT",
      "Google Gemini",
      "Claude AI",
      "AI Ajanlari",
      "React",
      "Next.js",
    ],
    publishingPrinciples: `${SITE.url}/hakkimizda`,
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE.author.email,
      contactType: "editorial",
      availableLanguage: "Turkish",
    },
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
  /** Varsayılan /yazilar/{slug} yerine özel URL path */
  urlPath?: string;
}): JsonLdObject {
  const articleUrl = params.urlPath
    ? `${SITE.url}${params.urlPath}`
    : `${SITE.url}/yazilar/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: articleUrl,
    image: params.image
      ? (params.image.startsWith("http") ? params.image : `${SITE.url}${params.image}`)
      : `${SITE.url}/api/og?title=${encodeURIComponent(params.title)}`,
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
      "@id": articleUrl,
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
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: params.title,
    description: params.description,
    url: `${SITE.url}/haberler/${params.slug}`,
    image: params.image
      ? (params.image.startsWith("http") ? params.image : `${SITE.url}${params.image}`)
      : `${SITE.url}/api/og?title=${encodeURIComponent(params.title)}`,
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
        name: params.sourceName ?? params.sourceUrl,
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
): JsonLdObject {
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
): JsonLdObject {
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

/** ItemList JSON-LD — koleksiyon/liste sayfaları için (Rich Snippet) */
export function itemListJsonLd(params: {
  name: string;
  description: string;
  items: Array<{ name: string; url: string; position?: number }>;
}): JsonLdObject {
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
}): JsonLdObject {
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

// ─── Person JSON-LD (E-E-A-T Author) ───

export function personJsonLd(params: {
  name: string;
  url: string;
  jobTitle: string;
  description: string;
  sameAs: string[];
  worksFor: string;
  image?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE.url}/#person-can-demir`,
    name: params.name,
    url: params.url,
    jobTitle: params.jobTitle,
    description: params.description,
    sameAs: params.sameAs,
    worksFor: {
      "@type": "Organization",
      name: params.worksFor,
      url: SITE.url,
    },
    knowsAbout: [
      "Yapay Zeka",
      "LLM Ekosistemi",
      "Prompt Muhendisligi",
      "Growth Hacking",
      "Dijital Icerik Stratejisi",
      "SEO",
      "Next.js",
      "TypeScript",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: "Editoryal Icerik Yoneticisi & Growth Hacking Uzmani",
      occupationalCategory: "15-1252.00",
      skills: "AI Content Engineering, SEO, Growth Hacking, Prompt Engineering",
    },
    nationality: {
      "@type": "Country",
      name: "Turkey",
    },
    ...(params.image && { image: params.image }),
  };
}

// ─── ProfilePage JSON-LD (Google 2024+ recommended) ───

export function profilePageJsonLd(params: {
  dateCreated: string;
  dateModified: string;
  mainEntity: ReturnType<typeof personJsonLd>;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: params.dateCreated,
    dateModified: params.dateModified,
    mainEntity: params.mainEntity,
  };
}
