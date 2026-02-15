// ─────────────────────────────────────────────────────────────
// AI Rehber — Bildirim İzni Bileşeni
// Push notification izni ister + periodic background sync kaydeder.
// Kurulum banner'ı kapandıktan sonra gösterilir.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";

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
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-up">
      <div className="relative rounded-2xl border border-white/[0.08] bg-surface-2/95 backdrop-blur-xl p-4 shadow-2xl shadow-primary-900/20">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-3 transition-colors"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-900/30 border border-primary-700/20 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-100">
              Yeni İçeriklerden Haberdar Ol
            </h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Yeni yazı, haber ve haftalık brifing yayınlandığında bildirim al.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={requestPermission}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition-colors"
              >
                <Bell className="h-3.5 w-3.5" />
                İzin Ver
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-surface-3 transition-colors"
              >
                Şimdi Değil
              </button>
            </div>
          </div>
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
