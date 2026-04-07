// ─────────────────────────────────────────────────────────────
// feedeep — Header Component
// Responsive navigation with mobile menu
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
    <header className="sticky top-0 z-40 w-full bg-surface-0/60 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="logo-gradient text-[22px] leading-none"
          aria-label="feedeep Ana Sayfa"
        >
          feedeep
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-900/30 text-primary-400"
                      : "text-gray-400 hover:text-gray-100 hover:bg-surface-2"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Auth + Search + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <AuthModal />

          {!loading && !user && (
            <button
              onClick={requestAuth}
              className="text-xs font-heading font-bold px-4 py-1.5 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:-translate-y-px transition-all"
            >
              Giris Yap
            </button>
          )}

          <Link
            href="/arama"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-surface-2 transition-colors"
            aria-label="Ara"
          >
            <Search className="h-5 w-5" />
          </Link>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-surface-2 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.04] bg-surface-0">
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
