// ─────────────────────────────────────────────────────────────
// feedeep — Bildirim İzni Bileşeni
// Gerçek Web Push Protocol (RFC 8291) subscription akışı:
//   1. Notification.requestPermission()
//   2. PushManager.subscribe() — VAPID public key ile
//   3. POST /api/push/subscribe — Supabase'e kaydet
// Popup Queue entegrasyonu: sıra gelince gösterilir
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import { usePopupQueue } from "./popup-queue";

/** base64url → Uint8Array (VAPID applicationServerKey için) */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0))) as Uint8Array<ArrayBuffer>;
}

export function NotificationPrompt() {
  const { current, enqueue, dismiss } = usePopupQueue();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Notification API veya Service Worker desteği yoksa gösterme
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    // Zaten izin verildiyse veya reddedildiyse gösterme
    if (Notification.permission !== "default") return;

    // Daha önce kapatıldıysa 30 gün sür
    const dismissed = localStorage.getItem("notif-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 30 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 3s sonra kuyruğa ekle
    const timer = setTimeout(() => enqueue("notification"), 3000);
    return () => clearTimeout(timer);
  }, [enqueue]);

  const requestPermission = useCallback(async () => {
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        dismiss();
        setLoading(false);
        return;
      }

      // ─── Gerçek Web Push subscription al ───
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY tanımlı değil.");
        dismiss();
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // ─── Backend'e kaydet ───
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        console.warn("[push] Subscription kaydedilemedi:", response.status);
      }

      // ─── Periodic sync kaydı (destekleniyorsa — bonus) ───
      await registerPeriodicSync(registration);

    } catch (err) {
      console.warn("[push] İzin akışı başarısız:", err);
    }

    dismiss();
    setLoading(false);
  }, [dismiss]);

  const handleDismiss = () => {
    localStorage.setItem("notif-dismissed", Date.now().toString());
    dismiss();
  };

  if (current !== "notification") return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-up">
      <div className="w-full max-w-xs rounded-2xl border border-white/[0.08] bg-surface-2/95 backdrop-blur-xl p-6 shadow-2xl">
        <p className="text-sm font-heading font-semibold text-gray-100 mb-2">
          Yeni İçeriklerden Haberdar Ol
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mb-5">
          Yeni yazı ve haberler yayınlandığında bildirim al.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={loading}
            className="flex-1 text-xs text-gray-400 hover:text-gray-200 border border-white/[0.06] hover:border-white/[0.12] px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Şimdi Değil
          </button>
          <button
            type="button"
            onClick={requestPermission}
            disabled={loading}
            className="flex-1 text-xs font-medium text-white bg-gradient-to-br from-[#7c3aed] to-[#a855f7] hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] px-3 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "İzin Ver"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Periodic Background Sync — bonus, sadece Chromium Android'de destekleniyor.
 * Ana push mekanizması değil; SW offline içerik kontrolü için ek katman.
 */
async function registerPeriodicSync(registration: ServiceWorkerRegistration) {
  try {
    if (!("periodicSync" in registration)) return;

    const status = await navigator.permissions.query({
      // @ts-expect-error — periodicSync henüz tüm TypeScript tanımlarında yok
      name: "periodic-background-sync",
    });

    if (status.state === "granted") {
      // @ts-expect-error — periodicSync register henüz standart TS tiplerinde yok
      await registration.periodicSync.register("content-check", {
        minInterval: 12 * 60 * 60 * 1000, // 12 saat
      });
    }
  } catch {
    // Desteklenmiyorsa sessizce devam
  }
}
