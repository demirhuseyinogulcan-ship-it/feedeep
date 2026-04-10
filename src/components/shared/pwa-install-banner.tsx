// ─────────────────────────────────────────────────────────────
// feedeep — PWA Install Prompt
// Mobilde "Uygulamayı Yükle" banner'ı gösterir
// Popup Queue entegrasyonu: sıra gelince gösterilir
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import { Download, X } from "lucide-react";
import { usePopupQueue } from "./popup-queue";
import { getSharedPrompt, consumeSharedPrompt } from "@/hooks/use-pwa-install";

export function PwaInstallBanner() {
  const { current, enqueue, dismiss } = usePopupQueue();

  const isIos =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(window.navigator.userAgent);

  useEffect(() => {
    // Service Worker'ı kaydet (PWA install prompt için şart)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) return;

    // Daha önce kapatıldıysa gösterme
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 2s sonra kuyruğa ekle
    const timer = setTimeout(() => enqueue("pwa"), 2000);
    return () => clearTimeout(timer);
  }, [enqueue]);

  const handleInstall = async () => {
    const prompt = getSharedPrompt();
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        consumeSharedPrompt();
      }
    }
    dismiss();
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-dismissed", Date.now().toString());
    dismiss();
  };

  if (current !== "pwa") return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-up">
      <div className="relative w-full max-w-xs rounded-2xl border border-white/[0.08] bg-surface-2/95 backdrop-blur-xl p-6 shadow-2xl">
        {/* Kapat butonu */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-3 transition-colors"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Üst satır: ikon + başlık */}
        <div className="flex items-center gap-3 pr-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-0 border border-white/[0.06] flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.png"
              alt="feedeep"
              width={40}
              height={40}
              className="rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-100">
              feedeep Uygulaması
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
              {isIos
                ? 'Paylaş → "Ana Ekrana Ekle" ile yükleyin'
                : "Anında erişim için ana ekranınıza ekleyin"}
            </p>
          </div>
        </div>

        {/* iOS talimat */}
        {isIos && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-primary-400">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>
              Safari menüsünden{" "}
              <strong className="text-gray-300">&quot;Ana Ekrana Ekle&quot;</strong>
            </span>
          </div>
        )}

        {/* Alt buton — tam genişlik */}
        <div className="mt-4">
          {!isIos && getSharedPrompt() ? (
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              Uygulamayı Yükle
            </button>
          ) : (
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-surface-3 hover:bg-surface-4 text-gray-300 text-sm font-medium transition-colors"
            >
              Anladım
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
