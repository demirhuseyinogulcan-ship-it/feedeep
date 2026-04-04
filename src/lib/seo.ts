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
  const canonical = canonicalUrl
    ? canonicalUrl.startsWith("http")
      ? canonicalUrl
      : `${SITE.url}${canonicalUrl}`
    : `${SITE.url}${canonicalPath ?? path}`;
  const ogParams = new URLSearchParams({ title });
  if (section) ogParams.set("category", section);
  if (publishedTime) ogParams.set("date", publishedTime.slice(0, 10));
  const ogImage = image ?? `${SITE.url}/api/og?${ogParams.toString()}`;

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
      site: "@airehbercom",
      creator: "@airehbercom",
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
    "@id": `${SITE.url}/#organization`,
    name: SITE.organization.name,
    url: SITE.url,
    email: SITE.author.email,
    description:
      "Yapay zeka dunyasinin Turkce rehberi. Guncel haberler, derinlemesine yazilar, prompt kutuphanesi ve AI model karsilastirmalari.",
    foundingDate: "2025-01-01",
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}${SITE.organization.logo}`,
      width: 512,
      height: 512,
    },
    sameAs: [SITE.author.linkedin, SITE.author.instagram],
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
    knowsAbout: [
      "Yapay Zeka",
      "Makine Ogrenmesi",
      "Buyuk Dil Modelleri",
      "Prompt Muhendisligi",
      "ChatGPT",
      "Google Gemini",
      "Claude AI",
      "AI Ajanlari",
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
}) {
  const articleUrl = params.urlPath
    ? `${SITE.url}${params.urlPath}`
    : `${SITE.url}/yazilar/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: articleUrl,
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
  totalChapters?: number;
  chapters: Array<{
    name: string;
    url: string;
    position: number;
    description?: string;
    educationalLevel?: string;
    timeRequired?: string;
  }>;
}) {
  const resolveUrl = (u: string) => (u.startsWith("http") ? u : `${SITE.url}${u}`);
  const totalMinutes = params.chapters.reduce((sum, ch) => {
    const mins = ch.timeRequired ? parseInt(ch.timeRequired.replace(/\D/g, ""), 10) : 15;
    return sum + (isNaN(mins) ? 15 : mins);
  }, 0);

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.name,
    description: params.description,
    url: resolveUrl(params.url),
    provider: {
      "@type": "Organization",
      name: params.provider ?? SITE.name,
      url: SITE.url,
    },
    inLanguage: params.language ?? "tr",
    isAccessibleForFree: true,
    numberOfCredits: 0,
    educationalLevel: "beginner",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${totalMinutes}M`,
      instructor: {
        "@type": "Person",
        name: SITE.author.name,
      },
    },
    // hasPart — Schema.org standard, Google-uyumlu
    hasPart: params.chapters.map((ch) => ({
      "@type": "LearningResource",
      name: ch.name,
      url: resolveUrl(ch.url),
      position: ch.position,
      learningResourceType: "tutorial",
      educationalLevel: ch.educationalLevel ?? "beginner",
      ...(ch.timeRequired && { timeRequired: ch.timeRequired }),
      ...(ch.description && { description: ch.description }),
      isPartOf: {
        "@type": "Course",
        name: params.name,
        url: resolveUrl(params.url),
      },
    })),
    ...(params.totalChapters && {
      numberOfItems: params.totalChapters,
    }),
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
  faq?: Array<{ question: string; answer: string }>;
}) {
  const resolveUrl = (u: string) => (u.startsWith("http") ? u : `${SITE.url}${u}`);

  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: params.name,
    description: params.description,
    url: resolveUrl(params.url),
    author: {
      "@type": "Person",
      name: SITE.author.name,
      url: SITE.author.linkedin,
    },
    publisher: organizationJsonLd(),
    inLanguage: "tr",
    isAccessibleForFree: true,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    keywords: params.keywords?.join(", "),
    learningResourceType: params.learningResourceType ?? "tutorial",
    educationalLevel: params.educationalLevel ?? "beginner",
    timeRequired: params.timeRequired ?? "PT15M",
    interactivityType: "mixed",
    ...(params.isPartOf && {
      isPartOf: {
        "@type": "Course",
        name: params.isPartOf.name,
        url: resolveUrl(params.isPartOf.url),
      },
    }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": resolveUrl(params.url),
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article [data-description]", "article h2"],
    },
  };
}

/** FAQ JSON-LD — Bölüm SSS bölümleri için (standalone export) */
export function rehberFaqJsonLd(
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

// ─── CreativeWork JSON-LD — Prompt Detay Sayfaları ───

export function creativeWorkJsonLd(params: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  category?: string;
}) {
  const resolveUrl = (u: string) =>
    u.startsWith("http") ? u : `${SITE.url}${u}`;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.title,
    description: params.description,
    url: resolveUrl(params.url),
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    author: {
      "@type": "Person",
      name: SITE.author.name,
      url: SITE.author.linkedin,
    },
    publisher: organizationJsonLd(),
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    ...(params.keywords && { keywords: params.keywords.join(", ") }),
    ...(params.category && { genre: params.category }),
    learningResourceType: "prompt template",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": resolveUrl(params.url),
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
}) {
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: params.dateCreated,
    dateModified: params.dateModified,
    mainEntity: params.mainEntity,
  };
}
