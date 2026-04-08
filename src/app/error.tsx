// ─────────────────────────────────────────────────────────────
// feedeep — Route Segment Error Boundary
// "The Void" tasarim sistemi: siyah zemin, mor sinyal vurgusu.
// Kullaniciya stack trace degil, platformun ruhuna uygun
// graceful fallback gosterir. Layout saglamdir — sadece icerik coker.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[feedeep] Route hatasi:", error);
  }, [error]);

  return (
    <section className="relative mx-auto max-w-lg px-4 py-28 text-center animate-fade-up overflow-hidden">
      {/* The Void — mor sinyal pulse */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 animate-breathe"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Kopuk sinyal ikonu */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary-500/20 bg-primary-500/5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-8 w-8 text-primary-400"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.981 0 13.788"
          />
          {/* Kesik cizgi — sinyal koptu */}
          <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-gray-100 mb-2 font-heading">
        Sinyal Koptu
      </h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-xs mx-auto">
        Icerik yuklenirken bir kesinti yasandi. Tekrar baglanmayi dene
        veya ana akisa don.
      </p>

      {error.digest && (
        <p className="text-[10px] font-mono text-gray-700 mb-6 tracking-wider select-all">
          #{error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.598a.75.75 0 0 0-.75.75v3.634a.75.75 0 0 0 1.5 0v-2.033l.262.263A7 7 0 0 0 17.25 12a.75.75 0 0 0-1.5 0 5.48 5.48 0 0 1-.438 2.124ZM4.688 8.576a5.5 5.5 0 0 1 9.201-2.466l.312.311h-2.433a.75.75 0 0 0 0 1.5h3.634a.75.75 0 0 0 .75-.75V3.537a.75.75 0 0 0-1.5 0v2.033l-.262-.263A7 7 0 0 0 2.75 8a.75.75 0 0 0 1.5 0 5.48 5.48 0 0 1 .438-2.124Z"
              clipRule="evenodd"
            />
          </svg>
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-surface-2 transition-colors"
        >
          Ana Akis
        </Link>
      </div>
    </section>
  );
}
