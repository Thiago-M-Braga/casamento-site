"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: "primary" | "outline" | "bordo";
  fullWidth?: boolean;
};

/** Botão "copiar" com fallback para navegadores sem Clipboard API. */
export function CopyButton({
  value,
  label = "Copiar",
  copiedLabel = "Copiado!",
  className,
  variant = "primary",
  fullWidth,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
      }
      setFailed(false);
      setCopied(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className={fullWidth ? "w-full" : undefined}>
      <Button variant={variant} onClick={copy} className={className} fullWidth={fullWidth}>
        {copied ? copiedLabel : label}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
      {failed ? (
        <p className="mt-2 text-xs text-red-700" role="alert">
          Não conseguimos copiar automaticamente. Selecione o texto acima e copie à mão.
        </p>
      ) : null}
    </div>
  );
}
