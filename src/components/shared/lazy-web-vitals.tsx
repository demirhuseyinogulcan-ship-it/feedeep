"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Lazy Web Vitals Wrapper
// Client Component icinde dynamic() kullanmak zorunlu —
// Server Component'ta ssr:false yasakli.
// WebVitalsReporter'i ilk JS bundle'dan cikarir,
// browser idle zamana kadar yuklenmez.
// ─────────────────────────────────────────────────────────────

import dynamic from "next/dynamic";

const WebVitalsReporter = dynamic(
  () =>
    import("./web-vitals-reporter").then(
      (m) => ({ default: m.WebVitalsReporter }),
    ),
  { ssr: false },
);

export function LazyWebVitals() {
  return <WebVitalsReporter />;
}
