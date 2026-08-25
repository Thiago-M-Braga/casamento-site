import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Formatos modernos primeiro (menor peso, melhor Lighthouse).
    formats: ["image/avif", "image/webp"],
    // Tamanhos alinhados aos breakpoints usados no projeto.
    deviceSizes: [375, 430, 640, 768, 1024, 1280, 1440, 1920],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
