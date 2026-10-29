import type { NextConfig } from "next";

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  process.env.NODE_ENV !== "production" ? "'unsafe-eval'" : "",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://va.vercel-scripts.com",
].filter(Boolean);

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src ${scriptSrc.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://images.pexels.com https://*.supabase.co https://www.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com https://*.vercel-insights.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "frame-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Static demo build (npm run build:demo): no API routes, no Supabase, no image optimizer.
const isStaticDemo = process.env.FEEDEEP_STATIC_DEMO === "1";

const nextConfig: NextConfig = {
  ...(isStaticDemo ? { output: "export" as const, trailingSlash: true } : {}),
  // Velite content layer entegrasyonu
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },

  // Turbopack uyumluluğu (Next.js 16+ varsayılan)
  turbopack: {},

  // Performans optimizasyonları
  reactStrictMode: true,
  poweredByHeader: false,

  // Resim optimizasyonu
  images: {
    unoptimized: isStaticDemo,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "feedeep.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },

  // Güvenlik headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      // llms.txt ve llms-full.txt için cache header
      {
        source: "/llms:path(.txt|-full.txt)",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },

  // Temiz URL redirect'leri
  async redirects() {
    return [
      // Trailing slash tutarlılığı
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },
};

// Velite Webpack Plugin — build sırasında content derler
class VeliteWebpackPlugin {
  static buildPromise: Promise<void> | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (!VeliteWebpackPlugin.buildPromise) {
        const dev = compiler.options.mode === "development";

        VeliteWebpackPlugin.buildPromise = import("velite")
          .then(({ build }) => build({ watch: dev, clean: !dev }))
          .then(() => undefined)
          .catch((error) => {
            VeliteWebpackPlugin.buildPromise = null;
            throw error;
          });
      }

      await VeliteWebpackPlugin.buildPromise;
    });
  }
}

export default nextConfig;
