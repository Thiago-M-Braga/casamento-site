"use client";

import { Button } from "@/components/ui/Button";
import type { Gift } from "@/types";

type PaymentButtonProps = {
  gift: Gift;
  /** Abre o modal de pagamento (mantido pela grade, para existir só um) */
  onPaymentRequest: (gift: Gift) => void;
  variant?: "primary" | "bordo" | "outline";
  fullWidth?: boolean;
  label?: string;
};

/**
 * Botão "Presentear".
 *
 * A escolha da forma de pagamento (cartão, boleto ou PIX) acontece no
 * `PaymentModal` — aqui só abrimos o modal, para o convidado decidir com calma.
 */
export function PaymentButton({
  gift,
  onPaymentRequest,
  variant = "primary",
  fullWidth,
  label = "Presentear",
}: PaymentButtonProps) {
  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      onClick={() => onPaymentRequest(gift)}
      aria-label={`${label}: ${gift.title}`}
    >
      {label}
    </Button>
  );
}
