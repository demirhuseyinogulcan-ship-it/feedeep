// ─────────────────────────────────────────────────────────────
// feedeep — Mobile Bottom Navigation
// Instagram/Substack tarzı sabit alt menü — sadece mobilde görünür
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, DatabaseZap, Home, Newspaper, PenLine, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { label: "Ana", href: "/", icon: Home },
  { label: "Haberler", href: "/haberler", icon: Newspaper },
  { label: "Yazılar", href: "/yazilar", icon: PenLine },
  { label: "Open", href: "/open-source", icon: Code2 },
  { label: "Scraping", href: "/web-scraping", icon: DatabaseZap },
  { label: "Arama", href: "/arama", icon: Search },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/[0.06] bg-surface-0/80 backdrop-blur-xl safe-area-bottom"
      aria-label="Mobil navigasyon"
    >
      <ul className="flex items-center h-14 max-w-lg mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg transition-colors",
                  isActive
                    ? "text-primary-400"
                    : "text-gray-600 active:text-gray-300",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="max-w-full truncate text-[8px] font-medium leading-none tracking-wide">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
