"use client";

import { useEffect, useState } from "react";

/**
 * QR Code do PIX gerado no navegador a partir do payload BR Code.
 * A biblioteca é carregada dinamicamente (import()), então não pesa no
 * bundle inicial de quem nunca abre o modal.
 */
export function PixQrCode({ payload, size = 208 }: { payload: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function generate() {
      try {
        const { toDataURL } = await import("qrcode");
        const url = await toDataURL(payload, {
          width: size * 2,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#2C3527", light: "#FDFBF7" },
        });
        if (active) setDataUrl(url);
      } catch {
        if (active) setFailed(true);
      }
    }

    if (payload) generate();
    return () => {
      active = false;
    };
  }, [payload, size]);

  if (failed || !payload) return null;

  return (
    <div
      className="mx-auto flex items-center justify-center rounded-lg border border-green-100 bg-beige-50 p-3"
      style={{ width: size + 24, height: size + 24 }}
    >
      {dataUrl ? (
        // Imagem gerada em runtime (data URL) — next/image não se aplica aqui.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="QR Code para pagamento via PIX"
          width={size}
          height={size}
          className="h-full w-full"
        />
      ) : (
        <div
          className="h-full w-full animate-pulse-soft rounded bg-beige-200"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
