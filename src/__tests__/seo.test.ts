// ─────────────────────────────────────────────────────────────
// AI Rehber — SEO Helpers Unit Tests
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  generateMeta,
  websiteJsonLd,
  organizationJsonLd,
  articleJsonLd,
  newsArticleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";
import { SITE } from "@/lib/constants";

// ─── generateMeta() ───

describe("generateMeta()", () => {
  it("generates correct metadata structure", () => {
    const meta = generateMeta({
      title: "Test Sayfa",
      description: "Test aciklama",
      path: "/test",
    });

    expect(meta.title).toBe("Test Sayfa");
    expect(meta.description).toBe("Test aciklama");
    expect(meta.alternates?.canonical).toBe(`${SITE.url}/test`);
  });

  it("uses custom canonical path when provided", () => {
    const meta = generateMeta({
      title: "Test",
      description: "Test",
      path: "/test/page",
      canonicalPath: "/test",
    });

    expect(meta.alternates?.canonical).toBe(`${SITE.url}/test`);
  });

  it("generates OG image URL when not provided", () => {
    const meta = generateMeta({
      title: "Test Sayfa",
      description: "Test",
      path: "/test",
    });

    const ogImages = meta.openGraph?.images;
    expect(ogImages).toBeDefined();
    expect(Array.isArray(ogImages) ? ogImages[0] : ogImages).toHaveProperty("url");
  });

  it("sets twitter metadata", () => {
    const meta = generateMeta({
      title: "Test",
      description: "Test",
      path: "/test",
    });

    expect(meta.twitter).toBeDefined();
    // Twitter object contains card, site, creator
    const twitter = meta.twitter as Record<string, unknown>;
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.site).toBe("@airehbercom");
    expect(twitter.creator).toBe("@airehbercom");
  });

  it("sets noIndex when specified", () => {
    const meta = generateMeta({
      title: "Test",
      description: "Test",
      path: "/test",
      noIndex: true,
    });

    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("includes article metadata for article type", () => {
    const meta = generateMeta({
      title: "Test",
      description: "Test",
      path: "/test",
      type: "article",
      publishedTime: "2026-03-05",
      section: "Analiz",
      tags: ["AI", "ML"],
    });

    const og = meta.openGraph as Record<string, unknown>;
    expect(og.type).toBe("article");
  });

  it("includes keywords when provided", () => {
    const meta = generateMeta({
      title: "Test",
      description: "Test",
      path: "/test",
      keywords: ["yapay zeka", "AI"],
    });

    expect(meta.keywords).toEqual(["yapay zeka", "AI"]);
  });
});

// ─── websiteJsonLd() ───

describe("websiteJsonLd()", () => {
  it("returns valid WebSite schema", () => {
    const ld = websiteJsonLd();

    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.name).toBe(SITE.name);
    expect(ld.url).toBe(SITE.url);
    expect(ld.inLanguage).toBe(SITE.language);
  });

  it("includes SearchAction", () => {
    const ld = websiteJsonLd();

    expect(ld.potentialAction["@type"]).toBe("SearchAction");
    expect(ld.potentialAction.target).toContain("/arama?q=");
  });

  it("includes publisher as Organization", () => {
    const ld = websiteJsonLd();

    expect(ld.publisher["@type"]).toBe("Organization");
  });
});

// ─── organizationJsonLd() ───

describe("organizationJsonLd()", () => {
  it("returns valid Organization schema", () => {
    const org = organizationJsonLd();

    expect(org["@type"]).toBe("Organization");
    expect(org["@id"]).toBe(`${SITE.url}/#organization`);
    expect(org.name).toBe(SITE.organization.name);
    expect(org.url).toBe(SITE.url);
  });

  it("includes logo with correct dimensions", () => {
    const org = organizationJsonLd();

    expect(org.logo["@type"]).toBe("ImageObject");
    expect(org.logo.width).toBe(512);
    expect(org.logo.height).toBe(512);
  });

  it("includes knowsAbout topics", () => {
    const org = organizationJsonLd();

    expect(org.knowsAbout).toBeInstanceOf(Array);
    expect(org.knowsAbout.length).toBeGreaterThan(0);
    expect(org.knowsAbout).toContain("Yapay Zeka");
  });

  it("includes contact point", () => {
    const org = organizationJsonLd();

    expect(org.contactPoint["@type"]).toBe("ContactPoint");
    expect(org.contactPoint.contactType).toBe("editorial");
  });
});

// ─── articleJsonLd() ───

describe("articleJsonLd()", () => {
  const params = {
    title: "Test Makale",
    description: "Test aciklama",
    slug: "test-makale",
    publishedTime: "2026-03-05",
  };

  it("returns valid Article schema", () => {
    const ld = articleJsonLd(params);

    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Article");
    expect(ld.headline).toBe("Test Makale");
    expect(ld.url).toBe(`${SITE.url}/yazilar/test-makale`);
  });

  it("uses custom urlPath when provided", () => {
    const ld = articleJsonLd({ ...params, urlPath: "/haberler/test" });

    expect(ld.url).toBe(`${SITE.url}/haberler/test`);
  });

  it("includes author as Person", () => {
    const ld = articleJsonLd(params);

    expect(ld.author["@type"]).toBe("Person");
    expect(ld.author.name).toBe(SITE.author.name);
  });

  it("includes word count and reading time when provided", () => {
    const ld = articleJsonLd({
      ...params,
      wordCount: 1500,
      readingTime: 8,
    });

    expect(ld.wordCount).toBe(1500);
    expect(ld.timeRequired).toBe("PT8M");
  });

  it("sets isAccessibleForFree to true", () => {
    const ld = articleJsonLd(params);
    expect(ld.isAccessibleForFree).toBe(true);
  });

  it("includes speakable specification", () => {
    const ld = articleJsonLd(params);
    expect(ld.speakable["@type"]).toBe("SpeakableSpecification");
  });
});

// ─── newsArticleJsonLd() ───

describe("newsArticleJsonLd()", () => {
  it("returns NewsArticle type", () => {
    const ld = newsArticleJsonLd({
      title: "Test Haber",
      description: "Test",
      slug: "test-haber",
      publishedTime: "2026-03-05",
    });

    expect(ld["@type"]).toBe("NewsArticle");
    expect(ld.url).toBe(`${SITE.url}/haberler/test-haber`);
  });
});

// ─── breadcrumbJsonLd() ───

describe("breadcrumbJsonLd()", () => {
  it("generates correct BreadcrumbList schema", () => {
    const items = [
      { name: "Ana Sayfa", href: "/" },
      { name: "Yazılar", href: "/yazilar" },
      { name: "Test Yazı", href: "/yazilar/test" },
    ];

    const ld = breadcrumbJsonLd(items);

    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(3);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[2].position).toBe(3);
  });

  it("sets correct item types", () => {
    const items = [{ name: "Test", href: "/test" }];
    const ld = breadcrumbJsonLd(items);

    expect(ld.itemListElement[0]["@type"]).toBe("ListItem");
  });
});

// ─── faqJsonLd() ───

describe("faqJsonLd()", () => {
  const faqs = [
    { question: "Soru 1?", answer: "Cevap 1" },
    { question: "Soru 2?", answer: "Cevap 2" },
  ];

  it("returns valid FAQPage schema", () => {
    const ld = faqJsonLd(faqs);

    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("FAQPage");
  });

  it("generates correct mainEntity array", () => {
    const ld = faqJsonLd(faqs);

    expect(ld.mainEntity).toHaveLength(2);
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
    expect(ld.mainEntity[0].name).toBe("Soru 1?");
    expect(ld.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("Cevap 1");
  });
});
