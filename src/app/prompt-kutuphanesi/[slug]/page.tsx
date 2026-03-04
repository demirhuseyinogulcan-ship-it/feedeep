// ─────────────────────────────────────────────────────────────
// AI Rehber — Prompt Detay Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { promptlar } from "#site/content";
import { generateMeta, breadcrumbJsonLd, creativeWorkJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PROMPT_CATEGORIES, DIFFICULTY } from "@/lib/constants";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PromptCard } from "@/components/content/prompt-card";
import { MDXContent } from "@/components/content/mdx-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return promptlar
    .filter((p) => p.published)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prompt = promptlar.find((p) => p.slug === slug && p.published);
  if (!prompt) return {};

  return generateMeta({
    title: prompt.title,
    description: prompt.description,
    path: `/prompt-kutuphanesi/${prompt.slug}`,
    type: "article",
    publishedTime: prompt.date,
    modifiedTime: prompt.updated,
    keywords: prompt.keywords,
  });
}

export default async function PromptDetayPage({ params }: Props) {
  const { slug } = await params;
  const prompt = promptlar.find((p) => p.slug === slug && p.published);
  if (!prompt) notFound();

  const categoryLabel = PROMPT_CATEGORIES[prompt.category] ?? prompt.category;

  return (
    <>
      <JsonLd
        data={[
          creativeWorkJsonLd({
            title: prompt.title,
            description: prompt.description,
            url: `/prompt-kutuphanesi/${prompt.slug}`,
            datePublished: prompt.date,
            dateModified: prompt.updated,
            keywords: prompt.keywords,
            category: categoryLabel,
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Prompt Kütüphanesi", href: "/prompt-kutuphanesi" },
            { name: prompt.title, href: `/prompt-kutuphanesi/${prompt.slug}` },
          ]),
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Prompt Kütüphanesi", href: "/prompt-kutuphanesi" },
            { label: prompt.title, href: `/prompt-kutuphanesi/${prompt.slug}` },
          ]}
        />

        <h1 className="text-3xl font-bold tracking-tight text-gray-100 mb-2">
          {prompt.title}
        </h1>
        <p className="text-gray-400 mb-2">{prompt.description}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
          <span>{categoryLabel}</span>
          <span className="text-gray-700">·</span>
          <span>{DIFFICULTY[prompt.difficulty]}</span>
        </div>

        <PromptCard
          title={prompt.title}
          prompt={prompt.prompt}
          difficulty={prompt.difficulty}
          targetRole={prompt.targetRole}
          models={prompt.models}
          variables={prompt.variables}
          commonMistakes={prompt.commonMistakes}
        />

        <div className="line-void my-12" />

        {/* MDX İçerik — detaylı açıklama ve örnek output */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={prompt.body} />
        </div>
      </section>
    </>
  );
}
