// ─────────────────────────────────────────────────────────────
// feedeep — Feed Data Layer
// Tüm içerik tiplerini birleşik akış (feed) olarak sunar
// ─────────────────────────────────────────────────────────────

import { yazilar, haberler } from "#site/content";
import {
  YAZI_CATEGORIES,
  HABER_CATEGORIES,
} from "@/lib/constants";
import { getPublicationDate, sortContent } from "@/lib/content-order";

// ─── Feed Item Types (Discriminated Union) ───

type BaseItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  date: string;
  publishedAt: string;
  category: string;
  categoryLabel: string;
  readingTime: number;
  editorPick: boolean;
  image?: string;
  imageAlt?: string;
  blurDataURL?: string;
};

export type HaberFeedItem = BaseItem & {
  type: "haber";
  sourceName: string;
  confidence: string;
};

export type YaziFeedItem = BaseItem & {
  type: "yazi";
  confidence: string;
};

export type FeedItem = HaberFeedItem | YaziFeedItem;

export type FeedItemType = FeedItem["type"];

// ─── Filter Configuration ───

export const FEED_FILTERS = [
  { key: "tumu" as const, label: "Tümü" },
  { key: "haber" as const, label: "Haberler" },
  { key: "yazi" as const, label: "Yazılar" },
] as const;

export type FeedFilterKey = (typeof FEED_FILTERS)[number]["key"];

// ─── Feed Builder ───

export function buildFeed(): FeedItem[] {
  const items: FeedItem[] = [];

  for (const h of haberler.filter((x) => x.published)) {
    items.push({
      id: `haber-${h.slug}`,
      type: "haber",
      title: h.title,
      description: h.description,
      href: `/haberler/${h.slug}`,
      date: h.date,
      publishedAt: getPublicationDate(h),
      category: h.category,
      categoryLabel: HABER_CATEGORIES[h.category] ?? h.category,
      readingTime: h.metadata.readingTime,
      editorPick: h.editorPick,
      image: h.image,
      imageAlt: h.imageAlt,
      blurDataURL: h.blurDataURL,
      sourceName: h.sourceName,
      confidence: h.confidence,
    });
  }

  for (const y of yazilar.filter((x) => x.published)) {
    items.push({
      id: `yazi-${y.slug}`,
      type: "yazi",
      title: y.title,
      description: y.description,
      href: `/yazilar/${y.slug}`,
      date: y.date,
      publishedAt: getPublicationDate(y),
      category: y.category,
      categoryLabel: YAZI_CATEGORIES[y.category] ?? y.category,
      readingTime: y.metadata.readingTime,
      editorPick: y.editorPick,
      image: y.image,
      imageAlt: y.imageAlt,
      blurDataURL: y.blurDataURL,
      confidence: y.confidence,
    });
  }

  // Tarihe göre sırala (en yeni en üstte)
  return sortContent(items);
}

// ─── Type-Specific Builders (listing sayfalari icin) ───

export function buildHaberFeed(): HaberFeedItem[] {
  return sortContent(
    haberler.filter((x) => x.published),
  )
    .map((h) => ({
      id: `haber-${h.slug}`,
      type: "haber" as const,
      title: h.title,
      description: h.description,
      href: `/haberler/${h.slug}`,
      date: h.date,
      publishedAt: getPublicationDate(h),
      category: h.category,
      categoryLabel: HABER_CATEGORIES[h.category] ?? h.category,
      readingTime: h.metadata.readingTime,
      editorPick: h.editorPick,
      image: h.image,
      imageAlt: h.imageAlt,
      blurDataURL: h.blurDataURL,
      sourceName: h.sourceName,
      confidence: h.confidence,
    }));
}

export function buildYaziFeed(): YaziFeedItem[] {
  return sortContent(
    yazilar.filter((x) => x.published),
  )
    .map((y) => ({
      id: `yazi-${y.slug}`,
      type: "yazi" as const,
      title: y.title,
      description: y.description,
      href: `/yazilar/${y.slug}`,
      date: y.date,
      publishedAt: getPublicationDate(y),
      category: y.category,
      categoryLabel: YAZI_CATEGORIES[y.category] ?? y.category,
      readingTime: y.metadata.readingTime,
      editorPick: y.editorPick,
      image: y.image,
      imageAlt: y.imageAlt,
      blurDataURL: y.blurDataURL,
      confidence: y.confidence,
    }));
}
