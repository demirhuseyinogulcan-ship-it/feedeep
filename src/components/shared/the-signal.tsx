// feedeep — Kayan Haber Şeridi: TV tarzı canlı gündem bandı
// Anasayfanın tepesinde, son haberlerin Montserrat fontlu sürekli akan şeridi

import Link from "next/link";
import { haberler, yazilar } from "#site/content";
import { getPublicationDate, sortContent } from "@/lib/content-order";

interface TickerItem {
  title: string;
  href: string;
  date: string;
  publishedAt: string;
}

function getTickerItems(): TickerItem[] {
  return sortContent([
    ...haberler
      .filter((h) => h.published)
      .map((h) => ({
        title: h.title,
        href: `/haberler/${h.slug}`,
        date: h.date,
        publishedAt: getPublicationDate(h),
      })),
    ...yazilar
      .filter((y) => y.published)
      .map((y) => ({
        title: y.title,
        href: `/yazilar/${y.slug}`,
        date: y.date,
        publishedAt: getPublicationDate(y),
      })),
  ])
    .slice(0, 15);
}

export function NewsTicker() {
  const items = getTickerItems();

  if (items.length === 0) return null;

  const renderItems = (keyPrefix: string) =>
    items.map((item, i) => (
      <span
        key={`${keyPrefix}-${i}`}
        className="inline-flex items-center shrink-0"
      >
        <Link
          href={item.href}
          className="font-heading text-[13px] font-medium text-gray-500 hover:text-white transition-colors duration-200"
        >
          {item.title}
        </Link>
        <span
          className="mx-5 text-[6px] text-gray-700 select-none"
          aria-hidden="true"
        >
          ●
        </span>
      </span>
    ));

  return (
    <div className="sticky top-14 z-20 bg-surface-0/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-2">
        <div className="flex items-center">
          {/* Sabit etiket */}
          <div className="shrink-0 flex items-center gap-2.5 pr-5 border-r border-white/[0.06]">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="animate-breathe absolute inline-flex h-full w-full rounded-full bg-white" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/80" />
            </span>
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white select-none">
              Gündem
            </span>
          </div>

          {/* Kayan alan */}
          <div className="overflow-hidden flex-1 relative ml-4 ticker-wrapper">
            {/* Sağ kenar fade efekti */}
            <div
              className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(to left, var(--color-surface-0), transparent)",
              }}
            />

            {/* Kayan içerik — iki kez render ile sonsuz döngü */}
            <div className="ticker-track flex w-max">
              {renderItems("a")}
              {renderItems("b")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
