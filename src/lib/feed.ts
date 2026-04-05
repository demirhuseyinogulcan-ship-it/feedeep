// ─────────────────────────────────────────────────────────────
// AI Rehber — Feed Data Layer
// Tüm içerik tiplerini birleşik akış (feed) olarak sunar
// ─────────────────────────────────────────────────────────────

import { yazilar, haberler, promptlar, haftalik } from "#site/content";
import {
  YAZI_CATEGORIES,
  HABER_CATEGORIES,
  PROMPT_CATEGORIES,
  DIFFICULTY,
} from "@/lib/constants";

// ─── Feed Item Types (Discriminated Union) ───

type BaseItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  date: string;
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

export type PromptFeedItem = BaseItem & {
  type: "prompt";
  promptPreview: string;
  difficulty: string;
  difficultyLabel: string;
};

export type HaftalikFeedItem = BaseItem & {
  type: "haftalik";
  weekNumber: number;
  highlights: { title: string }[];
};

export type FeedItem =
  | HaberFeedItem
  | YaziFeedItem
  | PromptFeedItem
  | HaftalikFeedItem;

export type FeedItemType = FeedItem["type"];

// ─── Filter Configuration ───

export const FEED_FILTERS = [
  { key: "tumu" as const, label: "Tümü" },
  { key: "haber" as const, label: "Haberler" },
  { key: "yazi" as const, label: "Yazılar" },
  { key: "prompt" as const, label: "Promptlar" },
  { key: "haftalik" as const, label: "Brifing" },
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
      categoryLabel: YAZI_CATEGORIES[y.category] ?? y.category,
      readingTime: y.metadata.readingTime,
      editorPick: y.editorPick,
      image: y.image,
      imageAlt: y.imageAlt,
      blurDataURL: y.blurDataURL,
      confidence: y.confidence,
    });
  }

  for (const p of promptlar.filter((x) => x.published)) {
    items.push({
      id: `prompt-${p.slug}`,
      type: "prompt",
      title: p.title,
      description: p.description,
      href: `/prompt-kutuphanesi/${p.slug}`,
      date: p.date,
      categoryLabel: PROMPT_CATEGORIES[p.category] ?? p.category,
      readingTime: p.metadata.readingTime,
      editorPick: false,
      promptPreview: p.prompt.split("\n").slice(0, 3).join("\n"),
      difficulty: p.difficulty,
      difficultyLabel: DIFFICULTY[p.difficulty] ?? p.difficulty,
    });
  }

  for (const b of haftalik.filter((x) => x.published)) {
    items.push({
      id: `haftalik-${b.slug}`,
      type: "haftalik",
      title: b.title,
      description: b.description,
      href: `/haftalik/${b.slug}`,
      date: b.date,
      categoryLabel: "Haftalık Brifing",
      readingTime: b.metadata.readingTime,
      editorPick: false,
      image: b.image,
      imageAlt: b.imageAlt,
      blurDataURL: b.blurDataURL,
      weekNumber: b.weekNumber,
      highlights: b.highlights?.map((hl) => ({ title: hl.title })) ?? [],
    });
  }

  // Tarihe göre sırala (en yeni en üstte)
  items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Editörün seçimini en üste sabitle
  const pinnedIdx = items.findIndex((i) => i.editorPick);
  if (pinnedIdx > 0) {
    const [pinned] = items.splice(pinnedIdx, 1);
    items.unshift(pinned);
  }

  return items;
}
