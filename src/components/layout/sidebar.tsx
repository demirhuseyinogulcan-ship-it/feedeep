// ─────────────────────────────────────────────────────────────
// feedeep — Desktop Sidebar
// Sabit sol panel: logo, navigasyon, iletisim.
// Sadece lg: ve ustunde gorunur. Mobilde Header + MobileNav kullanilir.
// Props: isOpen + onToggle — state LayoutShell'de yonetilir.
// usePathname ActiveLink'e taşındı — sidebar navigasyonda re-render olmaz.
// ─────────────────────────────────────────────────────────────

"use client";

import { Instagram, Linkedin } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ActiveLink } from "./active-link";
import { PopularWidget } from "./popular-widget";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"
      />
    </svg>
  );
}

function SubstackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M4 3h16v3H4V3Zm0 5h16v3H4V8Zm0 5h16v8l-8-4-8 4v-8Z" />
    </svg>
  );
}

export function Sidebar({ isOpen, onToggle }: Props) {
  return (
    <>
      {/* Toggle butonu — sidebar sağ kenarında kayar, logo yanında değil */}
      {/* Toggle butonu — dikey dikdörtgen, sidebar sağ kenarında kayar */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "hidden lg:flex fixed top-[96px] z-30 items-center justify-center w-6 h-9 rounded-lg",
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
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <ActiveLink
                  href={item.href}
                  label={item.label}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  activeClassName="bg-primary-900/30 text-primary-400"
                  inactiveClassName="text-gray-400 hover:text-gray-100 hover:bg-surface-2"
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* En çok okunan — yeterli veri yoksa otomatik gizlenir */}
        <div className="px-3 py-4 border-t border-white/[0.04]">
          <PopularWidget />
        </div>

        {/* Alt kisim: iletisim + copyright */}
        <div className="px-5 pb-5 pt-4 border-t border-white/[0.04] space-y-3">
          <div className="space-y-1.5">
            <a
              href={`mailto:${SITE.author.email}`}
              className="block text-[11px] text-gray-600 hover:text-primary-400 transition-colors"
            >
              {SITE.author.email}
            </a>
            <div className="flex items-center gap-2">
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="LinkedIn"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-surface-2 hover:text-primary-400 transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-surface-2 hover:text-primary-400 transition-colors"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href={SITE.social.x}
                target="_blank"
                rel="noopener noreferrer"
                title="X"
                aria-label="X"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-surface-2 hover:text-primary-400 transition-colors"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href={SITE.social.substack}
                target="_blank"
                rel="noopener noreferrer"
                title="Substack"
                aria-label="Substack"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-surface-2 hover:text-primary-400 transition-colors"
              >
                <SubstackIcon className="h-3.5 w-3.5" />
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
