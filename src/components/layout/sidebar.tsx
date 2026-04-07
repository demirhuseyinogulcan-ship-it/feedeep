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
      {/* Toggle butonu — sidebar sağ kenarında kayar, logo yanında değil */}
      {/* Toggle butonu — dikey dikdörtgen, sidebar sağ kenarında kayar */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "hidden lg:flex fixed top-20 z-20 items-center justify-center w-6 h-9 rounded-lg",
          "bg-surface-2 border border-white/[0.10] shadow-[0_2px_8px_rgba(0,0,0,0.6)]",
          "text-gray-500 hover:text-gray-200 hover:border-primary-500/50 hover:bg-primary-500/10",
          "transition-[left] duration-300 ease-in-out",
          isOpen ? "left-[210px]" : "left-1",
        )}
        aria-label={isOpen ? "Kenar çubuğunu kapat" : "Kenar çubuğunu aç"}
      >
        {/* 6 nokta — 2 sütun × 3 satır dikey grip */}
        <span className="grid grid-cols-2 gap-[3px]">
          <span className="w-[4px] h-[4px] rounded-full bg-current" />
          <span className="w-[4px] h-[4px] rounded-full bg-current" />
          <span className="w-[4px] h-[4px] rounded-full bg-current" />
          <span className="w-[4px] h-[4px] rounded-full bg-current" />
          <span className="w-[4px] h-[4px] rounded-full bg-current" />
          <span className="w-[4px] h-[4px] rounded-full bg-current" />
        </span>
      </button>

      {/* Sidebar panel */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-14 left-0 h-[calc(100dvh-3.5rem)] w-56 flex-col border-r border-white/[0.04] bg-surface-0/80 backdrop-blur-xl z-20",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo header'a taşındı — burada boşluk bırakılır */}
        <div className="pt-6 pb-8" />

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
    </>
  );
}
