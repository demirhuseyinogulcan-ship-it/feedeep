// AI Rehber — The Signal: Canlı AI Nabız Şeridi
// Anasayfanın tepesinde, son 24 saatte eklenen içerik sayısı ve en son haberin başlığı

import Link from "next/link";
import { yazilar, haberler } from "#site/content";
import { timeAgo } from "@/lib/utils";

function getSignalData() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const allContent = [
    ...yazilar.filter((y) => y.published).map((y) => ({ ...y, type: "yazi" as const })),
    ...haberler.filter((h) => h.published).map((h) => ({ ...h, type: "haber" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentCount = allContent.filter(
    (item) => new Date(item.date) >= last24h
  ).length;

  const latest = allContent[0];

  return { recentCount, latest };
}

export function TheSignal() {
  const { recentCount, latest } = getSignalData();

  if (!latest) return null;

  const latestHref =
    latest.type === "haber"
      ? `/haberler/${latest.slug}`
      : `/yazilar/${latest.slug}`;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 animate-fade-up">
      <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-gray-700">
        <span className="uppercase">Sinyal</span>
        <span className="text-gray-800">—</span>
        {recentCount > 0 ? (
          <span>{recentCount} yeni içerik</span>
        ) : (
          <span>Bugün henüz yeni sinyal yok</span>
        )}
        <span className="text-gray-800">·</span>
        <span className="hidden sm:inline text-gray-600 truncate max-w-[260px]">
          Son:{" "}
          <Link
            href={latestHref}
            className="hover:text-gray-400 transition-colors"
          >
            &ldquo;{latest.title}&rdquo;
          </Link>
        </span>
        <span className="text-gray-800 hidden sm:inline">·</span>
        <span className="text-gray-700">{timeAgo(latest.date)}</span>
      </div>
    </div>
  );
}
