import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
            value: "frame-ancestors 'none';",
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
