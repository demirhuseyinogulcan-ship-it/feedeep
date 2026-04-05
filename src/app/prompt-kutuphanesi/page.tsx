// ─────────────────────────────────────────────────────────────
// AI Rehber — Prompt Kütüphanesi Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { promptlar } from "#site/content";
import { generateMeta, collectionPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { PROMPT_CATEGORIES } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { FilterableContentList } from "@/components/shared/filterable-content-list";
import { buildPromptFeed } from "@/lib/feed";

export const metadata: Metadata = generateMeta({
  title: "AI Prompt Şablonları: Kopyala-Yapıştır Kullan [2026]",
  description:
    "ChatGPT, Claude ve Gemini için test edilmiş profesyonel prompt şablonları. Kopyala, değişkenleri doldur, yapıştır — model bazlı skorlar ve hata uyarıları dahil.",
  path: "/prompt-kutuphanesi",
  keywords: [
    "ai prompt",
    "chatgpt prompt",
    "prompt şablonu",
    "claude prompt",
    "yapay zeka prompt",
    "prompt kütüphanesi",
  ],
});

export default function PromptKutuphanesiPage() {
  const prompts = promptlar
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = buildPromptFeed();

  const categories = Object.entries(PROMPT_CATEGORIES).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "AI Prompt Kütüphanesi",
            description:
              "ChatGPT, Claude ve Gemini için test edilmiş, model bazlı skorlanmış prompt şablonları.",
            url: "/prompt-kutuphanesi",
            items: prompts.map((p) => ({
              name: p.title,
              url: `/prompt-kutuphanesi/${p.slug}`,
              description: p.description,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Prompt Kütüphanesi", href: "/prompt-kutuphanesi" },
          ]),
        ]}
      />

      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Prompt Kütüphanesi", href: "/prompt-kutuphanesi" },
          ]}
        />
        <PageHeader
          title="AI Prompt Kütüphanesi"
          description={`${prompts.length} adet test edilmiş, model bazlı skorlanmış prompt şablonu. Kopyala, değişkenleri doldur, yapıştır.`}
        />
        <FilterableContentList
          items={items}
          categories={categories}
          emptyMessage="Bu kategoride henüz prompt yok."
        />
      </section>
    </>
  );
}
