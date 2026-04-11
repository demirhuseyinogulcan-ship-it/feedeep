// feedeep — Header
// Logo (sol) + Arama (orta, sadece desktop) + İndir & Giriş Yap (sağ)
// Mobilde: logo + İndir + Giriş Yap — arama alttaki MobileNav'da var
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { Search, Download } from "lucide-react";
import { createPortal } from "react-dom";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/components/auth/auth-provider";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function Header() {
  const { user, loading, requestAuth } = useAuth();
  const { visible: showInstall, install, showGuide, closeGuide } = usePwaInstall();

  return (
    <header className="sticky top-0 z-30 w-full bg-surface-0/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="relative flex h-14 w-full items-center px-4 sm:px-6">
        {/* Logo — sol kenarda sabit */}
        <Link
          href="/"
          className="logo-gradient text-[20px] leading-none shrink-0"
          aria-label="feedeep Ana Sayfa"
        >
          feedeep
        </Link>

        {/* Arama — sadece desktop, header ortasında */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
          <Link
            href="/arama"
            className="flex items-center gap-2 h-9 px-4 rounded-full bg-surface-2 border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12] transition-colors"
            aria-label="Ara"
          >
            <Search className="h-4 w-4 shrink-0" />
            <kbd className="text-[11px] font-sans text-gray-700 not-italic">/</kbd>
          </Link>
        </div>

        {/* Sağ taraf: İndir → Profil/Giriş Yap */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {showInstall && (
            <button
              onClick={install}
              className="text-xs font-heading font-medium px-4 py-1.5 rounded-lg bg-white text-surface-0 hover:bg-gray-100 hover:-translate-y-px transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" />
                İndir
              </span>
            </button>
          )}

          <AuthModal />

          {!loading && (!user || user.isAnonymous) && (
            <button
              onClick={requestAuth}
              className="text-xs font-heading font-medium px-4 py-1.5 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:-translate-y-px transition-all"
            >
              Giriş Yap
            </button>
          )}
        </div>

        {/* PWA yükleme talimatı — native prompt yoksa gösterilir */}
        {showGuide && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeGuide}>
            <div
              className="mx-4 max-w-sm rounded-2xl border border-white/[0.08] bg-surface-2 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-gray-100">
                Uygulamayı Yükle
              </h3>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Tarayıcının menüsünden &quot;Ana Ekrana Ekle&quot; veya &quot;Uygulamayı Yükle&quot; seçeneğini kullan.
              </p>
              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                Chrome / Edge: adres çubuğundaki yükle simgesine tıkla.
                <br />
                Safari (iOS): Paylaş &rarr; Ana Ekrana Ekle.
              </p>
              <button
                onClick={closeGuide}
                className="mt-4 w-full text-xs font-medium py-2 rounded-lg bg-surface-3 text-gray-300 hover:bg-surface-4 transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>,
          document.body,
        )}
      </div>
    </header>
  );
}
