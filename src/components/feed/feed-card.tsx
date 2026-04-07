// ─────────────────────────────────────────────────────────────
// feedeep — Feed Card Dispatcher
// FeedItem tipine göre doğru kartı render eder
// Open/Closed: yeni tip eklemek = yeni case + yeni card file
// ─────────────────────────────────────────────────────────────

import type { FeedItem } from "@/lib/feed";
import { HaberCard } from "./haber-card";
import { YaziCard } from "./yazi-card";

type Props = { item: FeedItem; index: number };

export function FeedCard({ item, index }: Props) {
  switch (item.type) {
    case "haber":
      return <HaberCard item={item} index={index} />;
    case "yazi":
      return <YaziCard item={item} index={index} />;
  }
}
