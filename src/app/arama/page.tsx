// ─────────────────────────────────────────────────────────────
// feedeep — Search Page
// Tüm içeriklerde arama yapma sayfası
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { SearchUI } from "@/components/shared/search-ui";

export const metadata: Metadata = generateMeta({
  title: "Ara",
  description: "feedeep içeriklerinde arama yapın.",
  path: "/arama",
  noIndex: true,
});

export default function AramaPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", href: "/" },
          { name: "Ara", href: "/arama" },
        ])}
      />
      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Ara", href: "/arama" },
          ]}
        />
        <PageHeader
          title="Ara"
          description="Yazılar ve haberlerde arayın."
      />
        <SearchUI />
      </section>
    </>
  );
}
