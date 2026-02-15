// ─────────────────────────────────────────────────────────────
// AI Rehber — Minimal Service Worker for PWA Install Prompt
// Bu dosya sadece PWA install banner'ın çalışması için gerekli.
// Cache stratejisi yok — site zaten Vercel CDN'den hızlı.
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = "airehber-v1";

// Install — minimal cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/icon-192.png"]);
    })
  );
  self.skipWaiting();
});

// Activate — eski cache'leri temizle
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first (her zaman güncel içerik)
self.addEventListener("fetch", (event) => {
  // Sadece GET isteklerini yakala
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Offline ise cache'ten dön
        return caches.match(event.request);
      })
  );
});
