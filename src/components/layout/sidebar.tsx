// ─────────────────────────────────────────────────────────────
// feedeep — Desktop Sidebar
// Sabit sol panel: logo, navigasyon, iletisim.
// Sadece lg: ve ustunde gorunur. Mobilde Header + MobileNav kullanilir.
// Props: isOpen + onToggle — state LayoutShell'de yonetilir.
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export function Sidebar({ isOpen, onToggle }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 h-dvh w-56 flex-col border-r border-white/[0.04] bg-surface-0/80 backdrop-blur-xl z-40",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo + toggle */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-8">
          <Link
            href="/"
            className="logo-gradient text-[22px] leading-none"
            aria-label="feedeep Ana Sayfa"
          >
            feedeep
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2 border border-white/[0.06] text-gray-400 hover:text-gray-100 hover:border-primary-500/40 hover:bg-primary-500/10 transition-colors"
            aria-label="Kenar çubuğunu kapat"
          >
            <span className="flex gap-[3px]">
              <span className="w-[5px] h-[5px] rounded-full bg-current" />
              <span className="w-[5px] h-[5px] rounded-full bg-current" />
            </span>
          </button>
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
          </ul>
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

      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="hidden lg:flex fixed top-5 left-4 z-40 items-center justify-center w-9 h-9 rounded-full bg-surface-2 border border-white/[0.06] text-gray-400 hover:text-gray-100 hover:border-primary-500/40 hover:bg-primary-500/10 transition-colors"
          aria-label="Kenar çubuğunu aç"
        >
          <span className="flex gap-[3px]">
            <span className="w-[5px] h-[5px] rounded-full bg-current" />
            <span className="w-[5px] h-[5px] rounded-full bg-current" />
          </span>
        </button>
      )}
    </>
  );
}
