// ─────────────────────────────────────────────────────────────
// AI Rehber — Haftalık Brifing Listesi (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { haftalik } from "#site/content";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = generateMeta({
  title: "Haftalık AI Brifing",
  description:
    "Her hafta yapay zeka dünyasının en önemli 3 gelişmesi ve aksiyon önerileri.",
  path: "/haftalik",
});

export default function HaftalikPage() {
  const briefings = haftalik
    .filter((h) => h.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", href: "/" },
          { name: "Haftalık Brifing", href: "/haftalik" },
        ])}
      />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Haftalık Brifing", href: "/haftalik" },
          ]}
        />
        <PageHeader
          title="Haftalık AI Brifing"
        description="Her hafta yapay zeka dünyasının en önemli 3 gelişmesi ve pratik aksiyon önerileri."
      />

      <div className="space-y-0">
        {briefings.map((briefing, i) => (
          <Link
            key={briefing.slug}
            href={`/haftalik/${briefing.slug}`}
            className="group block py-6 animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                Hafta #{briefing.weekNumber}
              </span>
              <span className="text-[10px] text-gray-800">
                {formatDate(briefing.date)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-tight text-glow">
              {briefing.title}
            </h2>

            <ul className="mt-3 space-y-1">
              {briefing.highlights.map((h, j) => (
                <li key={j} className="text-sm text-gray-600 flex items-baseline gap-3">
                  <span className="text-[11px] font-mono text-gray-700 flex-shrink-0">
                    {String(j + 1).padStart(2, "0")}
                  </span>
                  {h.title}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[10px] font-mono tracking-wider text-gray-700">
              {briefing.weeklyAction}
            </p>
          </Link>
        ))}
      </div>

      {briefings.length === 0 && (
        <p className="text-gray-600 text-sm">Henüz brifing yayınlanmadı.</p>
      )}
      </section>
    </>
  );
}
