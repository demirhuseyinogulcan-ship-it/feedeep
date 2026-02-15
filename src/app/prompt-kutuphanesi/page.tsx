// ─────────────────────────────────────────────────────────────
// AI Rehber — Prompt Kütüphanesi Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { promptlar } from "#site/content";
import { generateMeta } from "@/lib/seo";
import { PROMPT_CATEGORIES, DIFFICULTY } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import {
  FilterableContentList,
  type ContentItem,
} from "@/components/shared/filterable-content-list";

export const metadata: Metadata = generateMeta({
  title: "Prompt Kütüphanesi",
  description:
    "Kullanıma hazır, model bazlı skorlanmış ve değişkenli AI prompt şablonları.",
  path: "/prompt-kutuphanesi",
});

export default function PromptKutuphanesiPage() {
  const prompts = promptlar
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items: ContentItem[] = prompts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    category: p.category,
    categoryLabel: PROMPT_CATEGORIES[p.category] ?? p.category,
    meta: DIFFICULTY[p.difficulty] ?? p.difficulty,
    href: `/prompt-kutuphanesi/${p.slug}`,
  }));

  const categories = Object.entries(PROMPT_CATEGORIES).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <PageHeader
        title="Prompt Kütüphanesi"
        description="Model bazlı skorlanmış, değişkenli ve hata senaryolu prompt şablonları."
      />
      <FilterableContentList
        items={items}
        categories={categories}
        emptyMessage="Bu kategoride henüz prompt yok."
      />
    </section>
  );
}
