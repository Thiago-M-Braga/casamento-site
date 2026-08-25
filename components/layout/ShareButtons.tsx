"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type ShareButtonsProps = {
  url: string;
  message: string;
  whatsappUrl: string;
  className?: string;
  variant?: "primary" | "outline" | "bordo";
};

/**
 * Compartilhamento do site.
 * Usa a API nativa de compartilhamento quando disponível (celular) e
 * cai para link do WhatsApp + copiar link no desktop.
 */
export function ShareButtons({
  url,
  message,
  whatsappUrl,
  className,
  variant = "outline",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function nativeShare() {
    if (!navigator.share) return false;
    try {
      await navigator.share({ title: document.title, text: message, url });
      return true;
    } catch {
      return true; // usuário cancelou — não mostrar erro
    }
  }

  async function handleShare() {
    if (await nativeShare()) return;

    try {
      await navigator.clipboard.writeText(`${message}\n\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <ButtonLink href={whatsappUrl} external variant={variant} size="sm">
        Enviar no WhatsApp
      </ButtonLink>

      <Button variant="ghost" size="sm" onClick={handleShare}>
        {copied ? "Link copiado!" : "Compartilhar"}
      </Button>

      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copiado para a área de transferência" : ""}
      </span>
    </div>
  );
}
