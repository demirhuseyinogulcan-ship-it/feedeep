// ─────────────────────────────────────────────────────────────
// feedeep — Okuma Takipçisi
// Makale sayfalarında scroll pozisyonu + okuma ilerlemesini kaydeder.
// Anasayfada "Kaldığın yerden devam et" banner'ı gösterir.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "feedeep-reading-progress";

interface ReadingData {
  /** Tam yol, örn. /yazilar/chatgpt-vs-claude */
  path: string;
  /** Makale başlığı */
  title: string;
  /** 0-100 arası okuma yüzdesi */
  progress: number;
  /** Scroll pozisyonu (px) */
  scrollY: number;
  /** Son güncelleme zamanı */
  updatedAt: number;
}

/**
 * Makale sayfalarında kullanılır.
 * Scroll pozisyonunu localStorage'a kaydeder.
 */
export function ReadingTracker({ title }: { title: string }) {
  const ticking = useRef(false);

  const saveProgress = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.round((scrollY / docHeight) * 100), 100) : 0;

    // %5'in altındaysa kaydetme (henüz okumaya başlamamış)
    if (progress < 5) return;

    const data: ReadingData = {
      path: window.location.pathname,
      title,
      progress,
      scrollY,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Sessizce devam et
    }
  }, [title]);

  useEffect(() => {
    // Sayfa açıldığında eski pozisyona dön
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ReadingData = JSON.parse(stored);
        if (data.path === window.location.pathname && data.scrollY > 100) {
          // Küçük bir gecikme ile scroll et (sayfa yüklensin)
          requestAnimationFrame(() => {
            window.scrollTo({ top: data.scrollY, behavior: "instant" });
          });
        }
      }
    } catch {}

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          saveProgress();
          ticking.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [saveProgress]);

  return null; // Görsel çıktı yok, sadece tracker
}

/**
 * localStorage'dan son okuma verisini döndürür.
 * Süresi dolmuşsa (7 gün) null döner.
 */
export function getLastReading(): ReadingData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: ReadingData = JSON.parse(stored);

    // 7 günden eskiyse sil
    if (Date.now() - data.updatedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // %100 tamamlandıysa gösterme
    if (data.progress >= 98) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Son okumayı temizler.
 */
export function clearLastReading() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
