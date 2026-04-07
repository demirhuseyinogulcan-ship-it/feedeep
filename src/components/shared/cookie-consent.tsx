// feedeep — KVKK / Çerez Bildirimi
// Glass morphism tasarım, 2 buton: Gereksiz Olanları Reddet + Kabul Et
// Her iki buton da consent kaydeder (zorunlu çerezler hariç tutma)

"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "feedeep-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-4 sm:max-w-sm z-50 animate-fade-up">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 shadow-2xl">
        <p className="text-sm text-gray-300 mb-2">
          Çerez Bildirimi
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Bu site, deneyiminizi iyileştirmek ve anonim kullanım istatistikleri
          toplamak için çerezleri kullanır.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleConsent}
            className="text-xs text-gray-500 hover:text-gray-300 bg-transparent border border-white/[0.06] px-3 py-1.5 rounded-md transition-colors"
          >
            Gereksiz Olanları Reddet
          </button>
          <button
            type="button"
            onClick={handleConsent}
            className="text-xs text-gray-200 bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 rounded-md transition-colors"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
