// ─────────────────────────────────────────────────────────────
// feedeep — Desktop Sidebar
// Sabit sol panel: logo, navigasyon, iletisim.
// Sadece lg: ve ustunde gorunur. Mobilde Header + MobileNav kullanilir.
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/components/auth/auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, requestAuth } = useAuth();

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-dvh w-56 flex-col border-r border-white/[0.04] bg-surface-0/80 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <Link
          href="/"
          className="logo-gradient text-[22px] leading-none"
          aria-label="feedeep Ana Sayfa"
        >
          feedeep
        </Link>
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-900/30 text-primary-400"
                      : "text-gray-400 hover:text-gray-100 hover:bg-surface-2",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Arama */}
          <li>
            <Link
              href="/arama"
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === "/arama"
                  ? "bg-primary-900/30 text-primary-400"
                  : "text-gray-400 hover:text-gray-100 hover:bg-surface-2",
              )}
            >
              <Search className="h-4 w-4" />
              Ara
            </Link>
          </li>
        </ul>

        {/* Auth */}
        <div className="mt-6 px-1">
          <AuthModal />
          {!loading && !user && (
            <button
              onClick={requestAuth}
              className="mt-2 w-full text-xs font-heading font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:-translate-y-px transition-all"
            >
              Giris Yap
            </button>
          )}
        </div>
      </nav>

      {/* Alt kisim: iletisim + copyright */}
      <div className="px-5 pb-5 pt-4 border-t border-white/[0.04] space-y-3">
        <div className="space-y-1.5">
          <a
            href={`mailto:${SITE.author.email}`}
            className="block text-[11px] text-gray-600 hover:text-primary-400 transition-colors"
          >
            {SITE.author.email}
          </a>
          <div className="flex items-center gap-3">
            <a
              href={SITE.author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-600 hover:text-primary-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={SITE.author.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-600 hover:text-primary-400 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
        <p className="text-[10px] text-gray-700">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </aside>
  );
}
