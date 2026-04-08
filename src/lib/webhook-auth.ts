// ─────────────────────────────────────────────────────────────
// feedeep — Webhook Signature Verification
// Timing-safe kriptografik doğrulama.
// Plain string === karşılaştırmadaki timing attack açığını kapatır.
// ─────────────────────────────────────────────────────────────

/**
 * Timing-safe string karşılaştırma.
 * `crypto.timingSafeEqual` her zaman sabit sürede çalışır —
 * saldırgan response süresi farkından secret'ı tahmin edemez.
 *
 * Edge Runtime + Node.js uyumlu: Web Crypto API kullanır.
 */
export function verifyWebhookSecret(provided: string | null, expected: string): boolean {
  if (!provided) return false;

  const encoder = new TextEncoder();
  const a = encoder.encode(provided);
  const b = encoder.encode(expected);

  // Uzunluk farkı varsa bile sabit sürede çalış.
  // Farklı uzunlukta buffer'ları timingSafeEqual'a veremeyiz,
  // bu yüzden aynı uzunluğa normalize edip sonucu AND'leriz.
  if (a.byteLength !== b.byteLength) {
    // Dummy karşılaştırma: timing leak verme
    const dummy = encoder.encode(expected);
    timingSafeEqual(dummy, b);
    return false;
  }

  return timingSafeEqual(a, b);
}

/**
 * Web Crypto API ile timing-safe karşılaştırma.
 * Node.js crypto.timingSafeEqual yerine — Edge Runtime uyumlu.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;

  let result = 0;
  for (let i = 0; i < a.byteLength; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
