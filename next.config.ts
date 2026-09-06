import type { NextConfig } from "next";

/**
 * Host do Supabase, lido da mesma variável que o resto do app usa.
 *
 * As fotos que os convidados enviam ficam no Storage do Supabase, fora de
 * /public — e o `next/image` só aceita domínio externo que esteja liberado
 * aqui. Sem isto, a galeria quebraria em produção exatamente no dia da festa.
 */
const supabaseHostname = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;

  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

/** Só o caminho dos arquivos públicos — nada mais do domínio é liberado. */
const STORAGE_PATH = "/storage/v1/object/public/**";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Projetos hospedados no Supabase. Cobre o caso normal mesmo que a variável
  // de ambiente não esteja disponível no momento do build.
  { protocol: "https", hostname: "*.supabase.co", pathname: STORAGE_PATH },
];

// Domínio próprio ou Supabase auto-hospedado: entra pela variável de ambiente.
if (supabaseHostname && !supabaseHostname.endsWith(".supabase.co")) {
  remotePatterns.push({ protocol: "https", hostname: supabaseHostname, pathname: STORAGE_PATH });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Formatos modernos primeiro (menor peso, melhor Lighthouse).
    formats: ["image/avif", "image/webp"],
    // Tamanhos alinhados aos breakpoints usados no projeto.
    deviceSizes: [375, 430, 640, 768, 1024, 1280, 1440, 1920],
    remotePatterns,
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
