// ─────────────────────────────────────────────────────────────
// AI Rehber — PWA Install Prompt
// Mobilde "Uygulamayı Yükle" banner'ı gösterir
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
  });

  useEffect(() => {
    // Service Worker'ı kaydet (PWA install prompt için şart)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW kayıt hatası — sessizce devam et
      });
    }

    const isStandalone =
      "standalone" in window.navigator &&
      (window.navigator as unknown as { standalone: boolean }).standalone;

    // Daha önce kapatıldıysa gösterme
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // 7 gün boyunca tekrar gösterme
    }

    // Zaten yüklüyse gösterme
    if (isStandalone || window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    if (isIos) {
      // iOS'ta 1.5 saniye sonra göster
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }

    // Android/Desktop — beforeinstallprompt event'i dinle
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 1.5 saniye sonra banner göster
      setTimeout(() => setShowBanner(true), 1500);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-up">
      <div className="relative rounded-2xl border border-white/[0.08] bg-surface-2/95 backdrop-blur-xl p-4 shadow-2xl shadow-primary-900/20">
        {/* Kapat butonu */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-3 transition-colors"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-0 border border-white/[0.06] flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.png"
              alt="AI Rehber"
              width={40}
              height={40}
              className="rounded-lg"
            />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-sm font-semibold text-gray-100">
              AI Rehber Uygulaması
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
              {isIos
                ? 'Paylaş → "Ana Ekrana Ekle" ile yükleyin'
                : "Anında erişim için ana ekranınıza ekleyin"}
            </p>

            {!isIos && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Uygulamayı Yükle
              </button>
            )}

            {isIos && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-primary-400">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>
                  Safari menüsünden{" "}
                  <strong className="text-gray-300">&quot;Ana Ekrana Ekle&quot;</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
