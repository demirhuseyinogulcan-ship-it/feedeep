// ─────────────────────────────────────────────────────────────
// feedeep — Breadcrumb Navigation (DRY shared component)
// Semantic breadcrumb with proper a11y and Next.js Link
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center gap-1.5 text-sm text-gray-600">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-gray-800">
                /
              </span>
            )}
            {i === items.length - 1 ? (
              <span className="text-gray-400 truncate max-w-[200px]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
