// ─────────────────────────────────────────────────────────────
// feedeep — JSON-LD Type System
// Schema.org yapıları için strict tip tanımları.
// `any` kullanmadan recursive JSON-serializable yapı.
// ─────────────────────────────────────────────────────────────

/**
 * JSON-LD'de geçerli tüm değer tipleri (recursive).
 * `any` yoktur — sadece JSON-serializable değerler kabul edilir.
 */
export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | JsonLdObject;

/**
 * JSON-LD objesi — tüm schema.org yapılarının üst tipi.
 * `@context`, `@type`, `@id`, `@graph` gibi LD alanlarını kabul eder.
 */
export type JsonLdObject = {
  [key: string]: JsonLdValue;
};
