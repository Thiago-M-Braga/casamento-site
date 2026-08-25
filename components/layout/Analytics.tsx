import Script from "next/script";
import { weddingConfig } from "@/config/wedding";

/**
 * Analytics opcional.
 *
 * Nada é injetado enquanto `weddingConfig.analytics.enabled` for false ou o ID
 * estiver vazio — o site não carrega script de terceiros sem configuração.
 */
export function Analytics() {
  const { enabled, googleAnalyticsId } = weddingConfig.analytics;

  if (!enabled || !googleAnalyticsId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
