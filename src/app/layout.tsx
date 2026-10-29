import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { fontHeading, fontSans } from "@/lib/fonts";
import { SITE } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LayoutShell } from "@/components/layout/layout-shell";
import { CursorGlow } from "@/components/layout/cursor-glow";
import { NewsTicker } from "@/components/shared/the-signal";
import { PwaInstallBanner } from "@/components/shared/pwa-install-banner";
import { NotificationPrompt } from "@/components/shared/notification-prompt";
import { PrefetchManager } from "@/components/shared/prefetch-manager";
import { LazyWebVitals } from "@/components/shared/lazy-web-vitals";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { PopupQueueProvider } from "@/components/shared/popup-queue";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
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
    site: "@feedeepofficial",
    creator: "@feedeepofficial",
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
        {/* Google Analytics — GA4
             afterInteractive: sayfa interaktif olur olmaz yukle.
             page_view'in bounce'lardan once tetiklenmesini garantiler.  */}
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
                gtag('consent', 'default', {
                  'analytics_storage': 'granted',
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied'
                });
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

        {/* Header — LayoutShell dışında, hiçbir zaman kaymaz */}
        <Header />

        <LayoutShell>
          {/* Gündem şeridi: tüm sayfalarda header altında */}
          <NewsTicker />

          <main id="main-content" className="min-h-[calc(100vh-16rem)]">
            {children}
          </main>

          {/* Footer: sadece mobilde (sidebar yokken) */}
          <div className="lg:hidden">
            <Footer />
          </div>
        </LayoutShell>

        {/* Mobil alt navigasyon (Instagram/Substack tarzı) */}
        <MobileNav />

        {/* Mobil nav için alt boşluk */}
        <div className="h-14 md:hidden" aria-hidden="true" />

        {/* Popup Kuyruğu: Çerez → PWA → Bildirim sırasıyla */}
        <PopupQueueProvider>
          <CookieConsent />
          <PwaInstallBanner />
          <NotificationPrompt />
        </PopupQueueProvider>

        {/* Navigation Prefetch */}
        <PrefetchManager />

        {/* Web Vitals → GA4 — Client wrapper ile lazy yuklenir */}
        <LazyWebVitals />

        {/* Vercel Web Analytics, not available on the static demo */}
        {process.env.FEEDEEP_STATIC_DEMO !== "1" && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  );
}
