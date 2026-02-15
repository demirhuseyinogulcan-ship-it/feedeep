import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Velite content layer entegrasyonu
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },

  // Performans optimizasyonları
  reactStrictMode: true,
  poweredByHeader: false,

  // Resim optimizasyonu
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "airehber.com" },
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
  static started = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = compiler.options.mode === "development";
      const { build } = await import("velite");
      await build({ watch: dev, clean: !dev });
    });
  }
}

export default nextConfig;
