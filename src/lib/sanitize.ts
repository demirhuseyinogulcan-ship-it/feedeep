// ─────────────────────────────────────────────────────────────
// feedeep — Text Sanitization (DOMPurify)
// Kullanıcı girdilerini temizler.
// Dynamic import → SSR'da yüklenmez, tree-shake dostu.
// ─────────────────────────────────────────────────────────────

/**
 * Metin girdisini DOMPurify ile sanitize et.
 * ALLOWED_TAGS=[] → tüm HTML etiketleri strip edilir.
 * Sonuç: saf metin, güvenli render.
 *
 * SSR ortamında ham metni olduğu gibi döndürür (yazma işlemleri
 * her zaman client-side çalışır, bu dal sadece güvenlik ağıdır).
 */
export async function sanitizeText(raw: string): Promise<string> {
  if (typeof window === "undefined") {
    return raw.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
  }

  const DOMPurify = (await import("dompurify")).default;
  return DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
