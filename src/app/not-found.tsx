// ─────────────────────────────────────────────────────────────
// AI Rehber — 404 Not Found
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-7xl font-bold text-primary-300 select-none mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-100 mb-2">
        Sayfa Bulunamadı
      </h1>
      <p className="text-gray-500 mb-8">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Ana Sayfa
        </Link>
        <Link
          href="/yazilar"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-surface-2 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          Yazılar
        </Link>
      </div>
    </section>
  );
}
