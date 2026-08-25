import { ImageResponse } from "next/og";
import { theme } from "@/config/theme";
import { weddingConfig } from "@/config/wedding";
import { formatWeddingDateLong } from "@/lib/utils/date";

export const alt = `Casamento de ${weddingConfig.couple.displayName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagem de Open Graph / Twitter Card gerada em build.
 * Assim o compartilhamento no WhatsApp já funciona sem depender de foto.
 * Para usar uma foto real, troque este arquivo por `opengraph-image.jpg`.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: theme.colors.beige[100],
          color: theme.colors.ink.DEFAULT,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: `1px solid ${theme.colors.bordo[300]}`,
          }}
        />

        <div
          style={{
            fontSize: 22,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: theme.colors.bordo[500],
          }}
        >
          Nosso casamento
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 92,
            color: theme.colors.green[800],
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          {weddingConfig.couple.displayName}
        </div>

        <div
          style={{
            marginTop: 30,
            width: 90,
            height: 1,
            background: theme.colors.bordo[300],
          }}
        />

        <div
          style={{
            marginTop: 30,
            fontSize: 30,
            color: theme.colors.ink.soft,
          }}
        >
          {formatWeddingDateLong()}
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 24,
            color: theme.colors.ink.muted,
          }}
        >
          {`${weddingConfig.ceremony.city} — ${weddingConfig.ceremony.state}`}
        </div>
      </div>
    ),
    size,
  );
}
