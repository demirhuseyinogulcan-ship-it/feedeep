// ─────────────────────────────────────────────────────────────
// feedeep — Feed Container (Server Component)
// Sonsuz scroll feed akışı.
// Kart markup'ı server'da render edilir — client bundle'a girmez.
// Etkileşim: InfiniteScroll micro client component'ta izole.
// ─────────────────────────────────────────────────────────────

import { Fragment } from "react";
import type { FeedItem } from "@/lib/feed";
import { FeedCard } from "./feed-card";
import { InfiniteScroll } from "./infinite-scroll";

type Props = {
  items: FeedItem[];
};

export function FeedContainer({ items }: Props) {
  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-0">
      <InfiniteScroll totalCount={items.length}>
        {items.map((item, i) => (
          <Fragment key={item.id}>
            {/* Gönderiler arası ince ayırıcı çizgi */}
            {i > 0 && (
              <div className="mx-auto w-12 h-px bg-white/[0.04]" />
            )}

            <FeedCard item={item} index={i} />
          </Fragment>
        ))}
      </InfiniteScroll>
    </div>
  );
}
