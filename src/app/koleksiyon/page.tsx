"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Koleksiyon Sayfası
// Sahiplenilen içeriklerin dikey mini kart grid'i.
// ─────────────────────────────────────────────────────────────

import { useMemo } from "react";
import Link from "next/link";
import { getOwnedIds, getOwnedCount } from "@/lib/signals";

type OwnedItem = {
  id: string;
  type: "haber" | "yazi";
  slug: string;
};

function parseOwnedId(id: string): OwnedItem | null {
  if (id.startsWith("haber-")) {
    return { id, type: "haber", slug: id.slice(6) };
  }
  if (id.startsWith("yazi-")) {
    return { id, type: "yazi", slug: id.slice(5) };
  }
  return null;
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function KoleksiyonPage() {
  const items = useMemo(() => {
    const ids = getOwnedIds();
    return ids.map(parseOwnedId).filter(Boolean) as OwnedItem[];
  }, []);
  const count = useMemo(() => getOwnedCount(), []);

  return (
    <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <span className="text-[11px] font-sans tracking-widest uppercase text-primary-400/80 mb-2 block">
          Koleksiyon
        </span>
        <h1 className="text-xl font-bold text-gray-200">
          Sahiplendiklerin
        </h1>
        {count > 0 && (
          <p className="mt-2 text-sm font-sans text-gray-600">
            {count} bilgi sahiplendin.
          </p>
        )}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 animate-fade-up delay-100">
          <p className="text-sm text-gray-600">
            Henuz bir sey sahiplenmedin.
          </p>
          <p className="mt-2 text-xs text-gray-700">
            Haberlerin ve yazilarin altindaki &quot;Sahip Ol&quot; butonuyla koleksiyonuna ekle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-up delay-100">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={item.type === "haber" ? `/haberler/${item.slug}` : `/yazilar/${item.slug}`}
              className="group block animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="aspect-[3/4] rounded-lg border border-white/[0.06] bg-surface-1 p-3 flex flex-col justify-between hover:border-primary-500/30 transition-colors">
                <span className="text-[8px] font-sans tracking-widest uppercase text-gray-700">
                  {item.type === "haber" ? "Haber" : "Yazi"}
                </span>
                <p className="text-[11px] font-medium text-gray-400 group-hover:text-gray-200 transition-colors leading-snug line-clamp-5 mt-auto">
                  {slugToTitle(item.slug)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
