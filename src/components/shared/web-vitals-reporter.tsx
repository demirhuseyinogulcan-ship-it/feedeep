// ─────────────────────────────────────────────────────────────
// feedeep — Web Vitals Raporlama
// LCP, FID, CLS, TTFB, INP metriklerini GA4'e gönderir.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function WebVitalsReporter() {
  const pathname = usePathname();

  useEffect(() => {
    // Dinamik import — sadece ihtiyaç olduğunda yükle
    import("web-vitals").then(({ onCLS, onLCP, onTTFB, onINP }) => {
      const sendToGA = (metric: { name: string; value: number; id: string; delta: number }) => {
        // GA4 event gönder
        if (typeof window !== "undefined" && "gtag" in window) {
          const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
          gtag("event", metric.name, {
            event_category: "Web Vitals",
            event_label: metric.id,
            value: Math.round(metric.name === "CLS" ? metric.delta * 1000 : metric.delta),
            non_interaction: true,
            // Custom dimensions
            metric_id: metric.id,
            metric_value: metric.value,
            metric_delta: metric.delta,
            page_path: pathname,
          });
        }

        // Console'a da logla (geliştirme için)
        if (process.env.NODE_ENV === "development") {
          console.log(`[Web Vitals] ${metric.name}:`, metric.value.toFixed(2));
        }
      };

      onCLS(sendToGA);
      onLCP(sendToGA);
      onTTFB(sendToGA);
      onINP(sendToGA);
    });
  }, [pathname]);

  return null;
}
