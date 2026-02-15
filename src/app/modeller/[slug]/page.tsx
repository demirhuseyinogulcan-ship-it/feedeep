// ─────────────────────────────────────────────────────────────
// AI Rehber — Model Detay Sayfası (Velite)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { kartlar } from "#site/content";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ModelCard } from "@/components/content/model-card";
import { MDXContent } from "@/components/content/mdx-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return kartlar
    .filter((k) => k.published)
    .map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const kart = kartlar.find((k) => k.slug === slug && k.published);
  if (!kart) return {};

  return generateMeta({
    title: kart.title,
    description: kart.description,
    path: `/modeller/${kart.slug}`,
    type: "article",
    publishedTime: kart.date,
    modifiedTime: kart.updated,
  });
}

export default async function ModelDetayPage({ params }: Props) {
  const { slug } = await params;
  const kart = kartlar.find((k) => k.slug === slug && k.published);
  if (!kart) notFound();

  const typeLabel = kart.type === "model" ? "Model" : "Araç";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", href: "/" },
          { name: "AI Modelleri", href: "/modeller" },
          { name: kart.title, href: `/modeller/${kart.slug}` },
        ])}
      />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "AI Modelleri", href: "/modeller" },
            { label: kart.title, href: `/modeller/${kart.slug}` },
          ]}
        />

        <ModelCard
          title={kart.title}
          company={kart.company}
          type={kart.type}
          status={kart.status}
          website={kart.website}
          pricing={kart.pricing}
          contextWindow={kart.contextWindow}
          releaseDate={kart.releaseDate}
          benchmarks={kart.benchmarks}
        />

        <div className="line-void my-12" />

        {/* MDX İçerik — detaylı inceleme */}
        <div className="animate-fade-up delay-200">
          <MDXContent code={kart.body} />
        </div>
      </section>
    </>
  );
}
