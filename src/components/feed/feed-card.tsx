// ─────────────────────────────────────────────────────────────
// feedeep — Feed Card Dispatcher
// FeedItem tipine göre doğru kartı render eder
// Open/Closed: yeni tip eklemek = yeni case + yeni card file
// ─────────────────────────────────────────────────────────────

import type { FeedItem } from "@/lib/feed";
import type { ArticleStats } from "@/lib/signals";
import { HaberCard } from "./haber-card";
import { YaziCard } from "./yazi-card";

type Props = { item: FeedItem; index: number; initialStats?: ArticleStats };

export function FeedCard({ item, index, initialStats }: Props) {
  switch (item.type) {
    case "haber":
      return <HaberCard item={item} index={index} initialStats={initialStats} />;
    case "yazi":
      return <YaziCard item={item} index={index} initialStats={initialStats} />;
  }
}
