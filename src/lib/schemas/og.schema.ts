// ─────────────────────────────────────────────────────────────
// feedeep — OG Image Input Schema (Zod)
// URL parametrelerini doğrula + zarif truncate.
// Uzun metin patlatmaz, keser ve render eder.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

/** Maksimum karakter limitleri — OG kartına sığacak değerler */
const MAX_TITLE = 120;
const MAX_CATEGORY = 40;
const MAX_DATE = 10; // YYYY-MM-DD

/**
 * Zarif truncate: limitin üstündeyse "..." ile kes.
 * Patlatmak yerine tasarıma sığdır.
 */
function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}

/**
 * OG Image parametreleri şeması.
 * searchParams'dan gelen string'leri doğrular ve truncate eder.
 */
export const ogInputSchema = z.object({
  title: z
    .string()
    .default("feedeep")
    .transform((v) => truncate(v, MAX_TITLE)),
  category: z
    .string()
    .default("")
    .transform((v) => truncate(v, MAX_CATEGORY)),
  date: z
    .string()
    .default("")
    .transform((v) => truncate(v, MAX_DATE)),
});

export type OgInput = z.infer<typeof ogInputSchema>;
