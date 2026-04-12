// ─────────────────────────────────────────────────────────────
// feedeep — Footer Component
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { SITE, NAV_ITEMS } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.04] bg-surface-0">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="logo-gradient text-lg leading-none inline-block" aria-label="feedeep Ana Sayfa">
              feedeep
            </Link>
            <p className="mt-3 text-xs text-gray-500 max-w-xs leading-relaxed">
              {SITE.description}
            </p>
          </div>

          {/* Sayfalar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Sayfalar
            </h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              İletişim
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${SITE.author.email}`}
                  className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
                >
                  {SITE.author.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
                >
                  X
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.substack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
                >
                  Substack
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {currentYear} {SITE.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/hakkimizda"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Hakkımızda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
