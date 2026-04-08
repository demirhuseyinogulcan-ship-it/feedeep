// feedeep — Header
// Logo (sol) + Arama (orta, sadece desktop) + Giriş Yap (sağ)
// Mobilde: logo + Giriş Yap — arama alttaki MobileNav'da var
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/components/auth/auth-provider";

export function Header() {
  const { user, loading, requestAuth } = useAuth();

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
            className="flex items-center gap-2 h-9 w-[280px] px-4 rounded-full bg-surface-2 border border-white/[0.06] text-sm text-gray-500 hover:text-gray-300 hover:border-white/[0.12] transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">daha derine dal...</span>
          </Link>
        </div>

        {/* Auth — sağ kenarda sabit */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <AuthModal />

          {!loading && !user && (
            <button
              onClick={requestAuth}
              className="text-xs font-heading font-bold px-4 py-1.5 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:-translate-y-px transition-all"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
