// ─────────────────────────────────────────────────────────────
// feedeep — Header Component
// Genis arama cubugu + Giris Yap — logo ve nav sidebar'da.
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/components/auth/auth-provider";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, requestAuth } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-surface-0/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex h-14 w-full items-center gap-3 px-4 sm:px-6">
        {/* Logo — her zaman görünür, sidebar'dan bağımsız */}
        <Link
          href="/"
          className="logo-gradient text-[20px] leading-none shrink-0"
          aria-label="feedeep Ana Sayfa"
        >
          feedeep
        </Link>

        {/* Arama çubuğu */}
        <Link
          href="/arama"
          className="flex items-center gap-2 h-9 w-full max-w-xs px-4 rounded-full bg-surface-2 border border-white/[0.06] text-sm text-gray-500 hover:text-gray-300 hover:border-white/[0.12] transition-colors"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">daha derine dal...</span>
        </Link>

        {/* Auth — sağa yapışık */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <AuthModal />

          {!loading && !user && (
            <button
              onClick={requestAuth}
              className="text-xs font-heading font-bold px-4 py-1.5 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:-translate-y-px transition-all"
            >
              Giris Yap
            </button>
          )}

          {/* Mobil: hamburger menu */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-surface-2 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Menuyu kapat" : "Menuyu ac"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobil Menu — nav linkleri (lg ustunde sidebar var) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.04] bg-surface-0">
          <ul className="flex flex-col p-4 gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-900/30 text-primary-400"
                        : "text-gray-400 hover:text-gray-100 hover:bg-surface-2"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
