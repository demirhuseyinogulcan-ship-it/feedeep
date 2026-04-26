import type { Metadata } from "next";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { WebScrapingConsole } from "@/components/tools/web-scraping-console";

export const metadata: Metadata = generateMeta({
  title: "Web Scraping Aracı: Firma ve E-posta Veri Kazıma",
  description:
    "Feedeep Web Scraping aracıyla firma araştırması yapın, web sitelerinden iletişim verisi çıkarın ve sonuçları Excel veya CSV olarak indirin.",
  path: "/web-scraping",
  noIndex: true,
  keywords: [
    "web scraping aracı",
    "veri kazıma",
    "firma veri kazıma",
    "e-posta kazıma",
    "Google firma arama",
    "Excel firma listesi",
  ],
});

export default function WebScrapingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", href: "/" },
          { name: "Web Scraping", href: "/web-scraping" },
        ])}
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Web Scraping", href: "/web-scraping" },
          ]}
        />

        <div className="mb-8 animate-fade-up">
          <span className="mb-2 block text-[11px] font-sans uppercase tracking-widest text-primary-400/80">
            Local Worker
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100 sm:text-3xl">
            Web Scraping
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
            Firma araması, iletişim verisi çıkarma ve Excel export işlemleri için local çalışan araştırma paneli.
          </p>
        </div>

        <WebScrapingConsole />
      </main>
    </>
  );
}
