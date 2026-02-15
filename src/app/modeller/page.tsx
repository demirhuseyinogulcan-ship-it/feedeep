// ─────────────────────────────────────────────────────────────
// AI Rehber — AI Modelleri Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { kartlar } from "#site/content";
import { generateMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = generateMeta({
  title: "AI Modelleri",
  description:
    "Yapay zeka model ve araçlarının fiyat, benchmark, context window ve durum bilgi kartları.",
  path: "/modeller",
});

export default function ModellerPage() {
  const models = kartlar
    .filter((k) => k.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <PageHeader
        title="AI Modelleri"
        description="Güncel fiyat, benchmark ve karşılaştırma bilgi kartları."
      />

      <div className="space-y-0">
        {models.map((model, i) => (
          <Link
            key={model.slug}
            href={`/modeller/${model.slug}`}
            className="group block py-6 animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                {model.company}
              </span>
              <span className="text-[10px] text-gray-800">
                {model.contextWindow ? `${(model.contextWindow / 1000).toFixed(0)}K` : ""}
                {model.releaseDate ? ` · ${formatDate(model.releaseDate)}` : ""}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-tight text-glow">
              {model.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-lg leading-relaxed">
              {model.description}
            </p>
          </Link>
        ))}
      </div>

      {models.length === 0 && (
        <p className="text-gray-600 text-sm">Henüz model kartı eklenmedi.</p>
      )}
    </section>
  );
}
