// ─────────────────────────────────────────────────────────────
// AI Rehber — Prefetch Manager
// Viewport'a giren linkleri ve popüler sayfaları önceden yükler.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Sayfa görüntülendiğinde ilgili alt sayfaları prefetch eder.
 * Next.js <Link> zaten viewport'taki linkleri prefetch eder,
 * bu bileşen ek olarak router.prefetch() ve native <link> prefetch kullanır.
 */
export function PrefetchManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Idle callback ile çalış — ana thread'i bloklamaz
    const id = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback(() => prefetchRelated(pathname), { timeout: 3000 })
      : setTimeout(() => prefetchRelated(pathname), 2000) as unknown as number;

    return () => {
      if (typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, [pathname]);

  return null;
}

function prefetchRelated(pathname: string) {
  // Mevcut sayfaya göre ilgili sayfaları prefetch et
  const routes: string[] = [];

  if (pathname === "/") {
    // Anasayfada — ana navigasyon sayfalarını prefetch et
    routes.push("/haberler", "/yazilar", "/prompt-kutuphanesi");
  } else if (pathname === "/yazilar") {
    routes.push("/haberler", "/haftalik");
  } else if (pathname === "/haberler") {
    routes.push("/yazilar", "/haftalik");
  }

  // Native <link rel="prefetch"> ile kaynak prefetch
  routes.forEach((route) => {
    // Zaten varsa tekrar ekleme
    if (document.querySelector(`link[href="${route}"]`)) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = route;
    link.as = "document";
    document.head.appendChild(link);
  });

  // Sayfadaki internal linkleri de IntersectionObserver ile izle
  observeViewportLinks();
}

/**
 * Viewport'a giren internal linkleri prefetch eder.
 * Next.js bunu Link component'i için yapıyor,
 * ama normal <a> tag'leri için de yapar (örn. MDX içerik).
 */
function observeViewportLinks() {
  if (typeof IntersectionObserver === "undefined") return;

  const prefetched = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const anchor = entry.target as HTMLAnchorElement;
        const href = anchor.getAttribute("href");

        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("/api/") &&
          !prefetched.has(href)
        ) {
          prefetched.add(href);

          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = href;
          link.as = "document";
          document.head.appendChild(link);

          observer.unobserve(anchor);
        }
      });
    },
    { rootMargin: "200px" }
  );

  // Internal linkleri bul ve izle
  document.querySelectorAll('a[href^="/"]').forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (href && !href.startsWith("/api/") && !prefetched.has(href)) {
      observer.observe(anchor);
    }
  });

  // Cleanup: sayfa değiştiğinde observer'ı kapat
  // (component unmount'ta useEffect cleanup çalışır)
}
