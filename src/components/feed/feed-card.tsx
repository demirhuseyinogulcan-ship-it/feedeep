// ─────────────────────────────────────────────────────────────
// AI Rehber — Feed Card Dispatcher
// FeedItem tipine göre doğru kartı render eder
// Open/Closed: yeni tip eklemek = yeni case + yeni card file
// ─────────────────────────────────────────────────────────────

import type { FeedItem } from "@/lib/feed";
import { HaberCard } from "./haber-card";
import { YaziCard } from "./yazi-card";
import { PromptFeedCard } from "./prompt-feed-card";
import { BrifingCard } from "./brifing-card";

type Props = { item: FeedItem; index: number };

export function FeedCard({ item, index }: Props) {
  switch (item.type) {
    case "haber":
      return <HaberCard item={item} index={index} />;
    case "yazi":
      return <YaziCard item={item} index={index} />;
    case "prompt":
      return <PromptFeedCard item={item} index={index} />;
    case "haftalik":
      return <BrifingCard item={item} index={index} />;
  }
}
