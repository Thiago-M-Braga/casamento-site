import { ImageResponse } from "next/og";
import { theme } from "@/config/theme";
import { weddingConfig } from "@/config/wedding";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon gerado a partir das iniciais do casal (nenhum arquivo binário necessário). */
export default function Icon() {
  const initials = `${weddingConfig.couple.bride.charAt(0)}${weddingConfig.couple.groom.charAt(0)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.colors.green[700],
          color: theme.colors.beige[100],
          fontSize: 30,
          letterSpacing: 1,
          borderRadius: 14,
        }}
      >
        {initials.toUpperCase()}
      </div>
    ),
    size,
  );
}
