import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { fontHeading, fontSans, fontMono } from "@/lib/fonts";
import { SITE } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorGlow } from "@/components/layout/cursor-glow";
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
    "yapay zeka",
    "AI",
    "ChatGPT",
    "prompt",
    "yapay zeka rehberi",
    "AI haberleri",
    "Türkçe AI",
  ],
  authors: [{ name: SITE.author.name, url: SITE.author.linkedin }],
  creator: SITE.author.name,
  publisher: SITE.name,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" dir="ltr" suppressHydrationWarning>
      <head>
        {/* PWA Manifest & Theme */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Rehber" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
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

        <CursorGlow />
        <Header />

        <main id="main-content" className="min-h-[calc(100vh-16rem)]">
          {children}
        </main>

        <Footer />

        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
