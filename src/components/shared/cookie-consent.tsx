// feedeep — Çerez Bildirimi
// "Kurabiye ister misiniz?" — eğlenceli ama KVKK uyumlu
// Popup Queue entegrasyonu: sıra gelince gösterilir

"use client";

import { useEffect } from "react";
import { usePopupQueue } from "./popup-queue";

const CONSENT_KEY = "feedeep-cookie-consent";

export function CookieConsent() {
  const { current, enqueue, dismiss } = usePopupQueue();

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // 1.5s sonra kuyruğa ekle
      const timer = setTimeout(() => enqueue("cookie"), 1500);
      return () => clearTimeout(timer);
    }
  }, [enqueue]);

  const handleConsent = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    dismiss();
  };

  if (current !== "cookie") return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-up">
      <div className="w-full max-w-xs rounded-2xl border border-white/[0.08] bg-surface-2/95 backdrop-blur-xl p-6 shadow-2xl text-center">
        {/* Kurabiye görseli */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/inbox/%C3%A7erezler%20%C5%9Feffaf%20logo.png"
          alt="Kurabiye"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />

        <h3 className="text-base font-heading font-semibold text-gray-100">
          Kurabiye ister misiniz?
        </h3>

        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
          Deneyiminizi iyileştirmek ve anonim kullanım istatistikleri toplamak için çerezleri kullanıyoruz.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleConsent}
            className="flex-1 text-xs text-gray-400 hover:text-gray-200 border border-white/[0.06] hover:border-white/[0.12] px-3 py-2 rounded-lg transition-colors"
          >
            Hayır
          </button>
          <button
            type="button"
            onClick={handleConsent}
            className="flex-1 text-xs font-medium text-white bg-gradient-to-br from-[#7c3aed] to-[#a855f7] hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] px-3 py-2 rounded-lg transition-all"
          >
            Tabii ki!
          </button>
        </div>
      </div>
    </div>
  );
}
