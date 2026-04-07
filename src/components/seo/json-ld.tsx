// ─────────────────────────────────────────────────────────────
// feedeep — JSON-LD Script Component (Reusable)
// Array geldiğinde @graph wrapper ile sar—Google standartlarına uygun
// ─────────────────────────────────────────────────────────────────

type JsonLdProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> | Record<string, any>[];
};

export function JsonLd({ data }: JsonLdProps) {
  const jsonLd = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data.map(({ "@context": _, ...rest }) => rest) }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
