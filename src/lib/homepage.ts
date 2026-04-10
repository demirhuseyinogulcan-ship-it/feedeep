// ─────────────────────────────────────────────────────────────
// feedeep — Homepage Data Helpers
// Anasayfa veri hazırlama mantığı (page.tsx'den çıkarıldı)
// ─────────────────────────────────────────────────────────────

import { yazilar, haberler } from "#site/content";
import { getPublicationDate, sortContent } from "@/lib/content-order";

// ─── Types ───

export type HeroItem = {
  title: string;
  description: string;
  slug: string;
  date: string;
  publishedAt: string;
  category: string;
  href: string;
  type: "yazi" | "haber";
  readingTime: number;
  editorPick: boolean;
  editorNote?: string;
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  blurDataURL?: string;
};

// ─── Filtered & Sorted Data ───

export const publishedYazilar = sortContent(yazilar.filter((y) => y.published));

export const publishedHaberler = sortContent(haberler.filter((h) => h.published));

// ─── Hero Item Selection ───

export function getHeroItem(): HeroItem | null {
  const candidates: HeroItem[] = [];

  for (const y of publishedYazilar) {
    candidates.push({
      title: y.title,
      description: y.description,
      slug: y.slug,
      date: y.date,
      publishedAt: getPublicationDate(y),
      category: y.category,
      href: `/yazilar/${y.slug}`,
      type: "yazi",
      readingTime: y.metadata.readingTime,
      editorPick: y.editorPick,
      editorNote: y.editorNote,
      image: y.image,
      imageAlt: y.imageAlt,
      imageCredit: y.imageCredit,
      blurDataURL: y.blurDataURL,
    });
  }

  for (const h of publishedHaberler) {
    candidates.push({
      title: h.title,
      description: h.description,
      slug: h.slug,
      date: h.date,
      publishedAt: getPublicationDate(h),
      category: h.category,
      href: `/haberler/${h.slug}`,
      type: "haber",
      readingTime: h.metadata.readingTime,
      editorPick: h.editorPick,
      editorNote: h.editorNote,
      image: h.image,
      imageAlt: h.imageAlt,
      imageCredit: h.imageCredit,
      blurDataURL: h.blurDataURL,
    });
  }

  if (candidates.length === 0) return null;

  const editorPick = candidates.find((c) => c.editorPick);
  if (editorPick) return editorPick;

  return sortContent(candidates)[0];
}

// ─── Section Data Builders ───

export function getRecentPosts(heroItem: HeroItem | null) {
  return publishedYazilar
    .filter(
      (post) => !(heroItem?.type === "yazi" && post.slug === heroItem.slug)
    )
    .slice(0, 8);
}

export function getLatestNews(heroItem: HeroItem | null) {
  return publishedHaberler
    .filter(
      (news) => !(heroItem?.type === "haber" && news.slug === heroItem.slug)
    )
    .slice(0, 8);
}

// ─── FAQ Data ───

export const FEEDEEP_FAQ = [
  {
    question: "feedeep nedir?",
    answer:
      "feedeep, yapay zeka, yazılım ve web geliştirme dünyasından güncel haberleri, derinlemesine analizleri ve araç incelemelerini Türkçe olarak sunan bağımsız bir yayın platformudur.",
  },
  {
    question: "feedeep hangi konuları takip ediyor?",
    answer:
      "Yapay zeka, yazılım geliştirme, web teknolojileri, siber güvenlik ve kodlama alanlarındaki güncel gelişmeleri takip ediyoruz. OpenAI, Google, Anthropic gibi şirketlerin duyurularından açık kaynak projelere kadar geniş bir yelpazede içerik üretiyoruz.",
  },
  {
    question: "feedeep'teki haberler güvenilir mi?",
    answer:
      "Her haber en az 2 güvenilir kaynakla doğrulanır ve güven seviyesi (yüksek/orta/spekülatif) şeffaf şekilde belirtilir. Orijinal kaynak linkleri her makalenin altında yer alır.",
  },
];
