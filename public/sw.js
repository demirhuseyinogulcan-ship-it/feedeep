// ─────────────────────────────────────────────────────────────
// feedeep — Service Worker v2
// Offline cache, push notification, navigation preload
// ─────────────────────────────────────────────────────────────

const STATIC_CACHE = "feedeep-static-v3";
const CONTENT_CACHE = "feedeep-content-v3";

// Statik dosyalar — her zaman cache'le
const STATIC_ASSETS = [
  "/",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

// İçerik sayfaları — navigation için cache'le
const CONTENT_ROUTES = [
  "/yazilar",
  "/haberler",
  "/hakkimizda",
];

function safeSameOriginPath(value) {
  try {
    const url = new URL(value || "/", self.location.origin);
    if (url.origin !== self.location.origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

// ─── Install ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  data.url = safeSameOriginPath(data.url);

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(CONTENT_CACHE).then((cache) =>
        cache.addAll(CONTENT_ROUTES).catch(() => {
          // Bazı sayfalar henüz yoksa sessizce devam
        })
      ),
    ])
  );
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const validCaches = [STATIC_CACHE, CONTENT_CACHE, "feedeep-meta"];
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => !validCaches.includes(key))
            .map((key) => caches.delete(key))
        )
      ),
      // Navigation preload (destekleniyorsa)
      self.registration.navigationPreload &&
        self.registration.navigationPreload.enable(),
    ])
  );
  self.clients.claim();
});

// ─── Fetch — akıllı cache stratejisi ────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Farklı origin'leri atla (analytics, fonts vs.)
  if (url.origin !== self.location.origin) return;

  // API route'ları cache'leme
  if (url.pathname.startsWith("/api/")) return;

  // HTML sayfaları — Network-first, offline'da cache
  if (
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      (async () => {
        // Navigation preload varsa kullan
        try {
          const preloadResponse =
            event.preloadResponse && (await event.preloadResponse);
          if (preloadResponse) {
            const cache = await caches.open(CONTENT_CACHE);
            cache.put(request, preloadResponse.clone());
            return preloadResponse;
          }
        } catch {}

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CONTENT_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // Offline — cache'ten dön
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/");
          return fallback || new Response("Çevrimdışısınız", { status: 503 });
        }
      })()
    );
    return;
  }

  // Statik dosyalar — Cache-first, arka planda güncelle
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches
                .open(STATIC_CACHE)
                .then((c) => c.put(request, networkResponse.clone()));
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Diğer — Network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(CONTENT_CACHE).then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ─── Push Notification ───────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "feedeep",
    body: "Yeni içerik yayınlandı!",
    url: "/",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: "feedeep-update",
      renotify: true,
      data: { url: data.url },
      actions: [
        { action: "open", title: "Oku" },
        { action: "dismiss", title: "Kapat" },
      ],
    })
  );
});

// ─── Notification Click ──────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = safeSameOriginPath(event.notification.data?.url);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

// ─── Periodic Background Sync — yeni içerik kontrolü ────────
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "content-check") {
    event.waitUntil(checkForNewContent());
  }
});

async function checkForNewContent() {
  try {
    const response = await fetch("/feed.xml");
    const text = await response.text();
    // Feed'in hash'ini al
    const hash = await digestMessage(text);
    const lastHash = await getStoredValue("feed-hash");

    if (lastHash && hash !== lastHash) {
      await storeValue("feed-hash", hash);
      await self.registration.showNotification("feedeep", {
        body: "Yeni içerik yayınlandı! Göz atmak ister misiniz?",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "new-content",
        data: { url: "/" },
        actions: [
          { action: "open", title: "Oku" },
          { action: "dismiss", title: "Sonra" },
        ],
      });
    } else {
      await storeValue("feed-hash", hash);
    }
  } catch {
    // Sessizce devam
  }
}

async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getStoredValue(key) {
  try {
    const cache = await caches.open("feedeep-meta");
    const response = await cache.match(key);
    if (response) return response.text();
  } catch {}
  return null;
}

async function storeValue(key, value) {
  const cache = await caches.open("feedeep-meta");
  await cache.put(key, new Response(value));
}
