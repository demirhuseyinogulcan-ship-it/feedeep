import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { fontHeading, fontSans } from "@/lib/fonts";
import { SITE } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CursorGlow } from "@/components/layout/cursor-glow";
import { PwaInstallBanner } from "@/components/shared/pwa-install-banner";
import { NotificationPrompt } from "@/components/shared/notification-prompt";
import { PrefetchManager } from "@/components/shared/prefetch-manager";
import { WebVitalsReporter } from "@/components/shared/web-vitals-reporter";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

// ─── Analytics ID'leri (.env veya constants'tan) ────────────
// Vercel'e deploy ettikten sonra:
//   1. Google Analytics → GA4 Measurement ID'yi al (G-XXXXXXXXXX)
//   2. Vercel Dashboard → Settings → Environment Variables →
//      NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "yapay zeka haberleri",
    "AI haberleri",
    "yazılım haberleri",
    "AI araçları",
    "yapay zeka",
    "feedeep",
  ],
  authors: [{ name: SITE.author.name }],
  creator: SITE.author.name,
  publisher: SITE.name,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
    images: [{
      url: `${SITE.url}/api/og?title=${encodeURIComponent(SITE.title)}`,
      width: 1200,
      height: 630,
      alt: SITE.title,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    site: "@feedeepcom",
    creator: "@feedeepcom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console — Vercel env: NEXT_PUBLIC_GSC_ID
    // Deploy sonrası Search Console'dan doğrulama kodu alıp ekle
    google: process.env.NEXT_PUBLIC_GSC_ID || undefined,
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260301" },
      { url: "/icon-192.png?v=20260301", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png?v=20260301", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=20260301", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico?v=20260301"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" dir="ltr" suppressHydrationWarning>
      <head>
        {/* hreflang — uluslararası sinyal */}
        <link rel="alternate" hrefLang="tr" href="https://feedeep.com" />
        <link rel="alternate" hrefLang="x-default" href="https://feedeep.com" />
        <link rel="alternate" type="application/rss+xml" title="feedeep RSS" href="https://feedeep.com/feed.xml" />

        {/* PWA Manifest & Theme */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico?v=20260301" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=20260301" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=20260301" />
        <meta name="theme-color" content="#050505" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="feedeep" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20260301" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </head>
      <body
        className={`${fontHeading.variable} ${fontSans.variable} font-sans antialiased`}
      >
        {/* Google Analytics — GA4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Skip to content — erişilebilirlik */}
        <a href="#main-content" className="skip-to-content">
          İçeriğe geç
        </a>

        <AuthProvider>
        <CursorGlow />
        <Header />

        <main id="main-content" className="min-h-[calc(100vh-16rem)]">
          {children}
        </main>

        <Footer />

        {/* Mobil alt navigasyon (Instagram/Substack tarzı) */}
        <MobileNav />

        {/* Mobil nav için alt boşluk */}
        <div className="h-14 md:hidden" aria-hidden="true" />

        {/* KVKK Çerez Bildirimi */}
        <CookieConsent />

        {/* PWA Install Banner */}
        <PwaInstallBanner />

        {/* Bildirim İzni */}
        <NotificationPrompt />

        {/* Navigation Prefetch */}
        <PrefetchManager />

        {/* Web Vitals → GA4 */}
        <WebVitalsReporter />

        {/* Vercel Web Analytics */}
        <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
