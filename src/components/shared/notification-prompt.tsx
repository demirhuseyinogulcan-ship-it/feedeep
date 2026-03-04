// ─────────────────────────────────────────────────────────────
// AI Rehber — Bildirim İzni Bileşeni
// Push notification izni ister + periodic background sync kaydeder.
// Kurulum banner'ı kapandıktan sonra gösterilir.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Notification API desteği yoksa gösterme
    if (!("Notification" in window)) return;

    // Zaten izin verildiyse veya reddedildiyse gösterme
    if (Notification.permission !== "default") return;

    // Daha önce kapatıldıysa 30 gün sür
    const dismissed = localStorage.getItem("notif-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 30 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Standalone (PWA olarak yüklü) ise daha erken göster
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    // PWA'da 3s, tarayıcıda 10s sonra göster
    const delay = isStandalone ? 3000 : 10000;
    const timer = setTimeout(() => setShow(true), delay);

    return () => clearTimeout(timer);
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Başarılı — periodic sync kaydet (destekleniyorsa)
        await registerPeriodicSync();

        // Hoşgeldin bildirimi gönder
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification("AI Rehber", {
            body: "Bildirimler aktif! Yeni içeriklerden haberdar olacaksınız.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "welcome",
          });
        }
      }
    } catch {
      // Permission request başarısız — sessizce devam
    }

    setShow(false);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("notif-dismissed", Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-fade-up">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 shadow-2xl">
        <p className="text-sm text-gray-300 mb-2">
          Yeni İçeriklerden Haberdar Ol
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Yeni yazı, haber ve haftalık brifing yayınlandığında bildirim al.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-gray-500 hover:text-gray-300 bg-transparent border border-white/[0.06] px-3 py-1.5 rounded-md transition-colors"
          >
            Şimdi Değil
          </button>
          <button
            type="button"
            onClick={requestPermission}
            className="text-xs text-gray-200 bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 rounded-md transition-colors"
          >
            İzin Ver
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Periodic Background Sync kaydı — tarayıcı destekliyorsa
 * Her 12 saatte bir yeni içerik kontrol eder (SW'deki handler ile)
 */
async function registerPeriodicSync() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Periodic sync desteği kontrolü
    if ("periodicSync" in registration) {
      const status = await navigator.permissions.query({
        // @ts-expect-error — periodicSync henüz tüm TypeScript tanımlarında yok
        name: "periodic-background-sync",
      });

      if (status.state === "granted") {
        // @ts-expect-error
        await registration.periodicSync.register("content-check", {
          minInterval: 12 * 60 * 60 * 1000, // 12 saat
        });
      }
    }
  } catch {
    // Periodic sync desteklenmiyorsa sessizce devam
  }
}
