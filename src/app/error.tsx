// ─────────────────────────────────────────────────────────────
// AI Rehber — Global Error Boundary
// Hata durumlarında crawler confusion'ı önler, UX korur
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hataları loglama (GA4 veya monitoring servisine gönderilebilir)
    console.error("[feedeep] Uygulama hatası:", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center animate-fade-up">
      <p className="text-6xl font-bold text-primary-300/60 select-none mb-4 font-heading tracking-tight">
        Hata
      </p>
      <h1 className="text-2xl font-bold text-gray-100 mb-2 font-heading">
        Bir Sorun Oluştu
      </h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
        Sayfa yüklenirken beklenmeyen bir hata meydana geldi.
        Sorunu çözmeyi deneyebilir veya ana sayfaya dönebilirsiniz.
      </p>

      {error.digest && (
        <p className="text-[10px] font-sans text-gray-700 mb-6 tracking-wider">
          Referans: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors cursor-pointer"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-surface-2 transition-colors"
        >
          Ana Sayfa
        </Link>
      </div>
    </section>
  );
}
