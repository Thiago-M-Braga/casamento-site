import { weddingConfig } from "@/config/wedding";

/**
 * URL base do site.
 * Ordem de prioridade: env pública → URL da Vercel → config → localhost.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  const fromConfig = weddingConfig.site.url?.trim();
  if (fromConfig) return fromConfig.replace(/\/$/, "");

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Mensagem pronta para compartilhar no WhatsApp. */
export function getShareMessage(): string {
  return `${weddingConfig.share.message}\n\n${getSiteUrl()}`;
}

export function getWhatsappShareUrl(): string {
  return `https://wa.me/?text=${encodeURIComponent(getShareMessage())}`;
}
