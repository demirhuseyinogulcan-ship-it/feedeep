"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — ActiveLink (Micro Client Component)
// Tek sorumluluk: usePathname() ile aktif navigasyon stili.
// Sidebar'dan usePathname bağımlılığını ayırır →
// navigasyonda sadece bu component re-render olur, sidebar olmaz.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

export function ActiveLink({
  href,
  label,
  className = "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
  activeClassName = "bg-primary-900/30 text-primary-400",
  inactiveClassName = "text-gray-400 hover:text-gray-100 hover:bg-surface-2",
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={cn(className, isActive ? activeClassName : inactiveClassName)}>
      {label}
    </Link>
  );
}
