// ─────────────────────────────────────────────────────────────
// feedeep — JSON-LD Script Component (Reusable)
// Array geldiğinde @graph wrapper ile sar—Google standartlarına uygun
// XSS koruması: tüm `<` karakteri \u003c ile escape edilir.
// ─────────────────────────────────────────────────────────────────

import type { JsonLdObject } from "@/lib/schemas/json-ld.types";

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

/**
 * JSON-LD çıktısını HTML-safe hale getirir.
 * `<` → `\u003c` dönüşümü `</script>` breakout XSS vektörünü kapatır.
 * Bu yöntem Next.js ve Google'ın önerdiği standart yaklaşımdır.
 */
function safeJsonLdStringify(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: JsonLdProps) {
  const jsonLd: JsonLdObject = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data.map(({ "@context": _, ...rest }) => rest) }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
    />
  );
}
