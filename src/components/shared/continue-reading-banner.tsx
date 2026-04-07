// ─────────────────────────────────────────────────────────────
// feedeep — "Kaldığın Yerden Devam Et" Banner
// Anasayfada yarım bırakılan makaleye dönüş butonu gösterir.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, X } from "lucide-react";
import { getLastReading } from "./reading-tracker";

export function ContinueReadingBanner() {
  const [reading, setReading] = useState<{
    path: string;
    title: string;
    progress: number;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    requestAnimationFrame(() => {
      // Daha önce kapatıldıysa gösterme
      const dismissed = sessionStorage.getItem("continue-reading-dismissed");
      if (dismissed) return;

      const data = getLastReading();
      // Sadece mevcut sayfa farklıysa göster
      if (data && data.path !== window.location.pathname) {
        setReading(data);
      }
    });
  }, [isMobile]);

  const handleDismiss = () => {
    // Bu oturum boyunca bir daha gösterme
    sessionStorage.setItem("continue-reading-dismissed", "1");
    setReading(null);
  };

  if (!reading) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-4 animate-fade-up">
      <div className="relative rounded-xl border border-white/[0.06] bg-surface-2/80 backdrop-blur-sm px-4 py-3">
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-3 transition-colors"
          aria-label="Kapat"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <Link
          href={reading.path}
          className="flex items-center gap-3 pr-6 group"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-900/30 border border-primary-700/20 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-sans tracking-widest uppercase text-gray-600">
              Kaldığın yerden devam et
            </p>
            <p className="text-sm font-medium text-gray-200 group-hover:text-primary-400 transition-colors truncate mt-0.5">
              {reading.title}
            </p>
          </div>

          {/* İlerleme göstergesi */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-12 h-1 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${reading.progress}%` }}
              />
            </div>
            <span className="text-[10px] font-sans text-gray-600">
              %{reading.progress}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
