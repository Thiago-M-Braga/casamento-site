import type { Gift, PaymentStatus } from "@/types";

/**
 * ABSTRAÇÃO DE PAGAMENTO
 * ---------------------------------------------------------------------------
 * A primeira versão do site usa links de pagamento reutilizáveis + PIX manual.
 * Quando o casal quiser integrar o Checkout do Mercado Pago, basta trocar a
 * implementação — as páginas e componentes continuam iguais.
 */

export type CreatePaymentInput = {
  gift: Gift;
  /** Valor em reais. Permite "presente livre" com valor escolhido pelo convidado. */
  amount?: number;
  payerName?: string;
  payerEmail?: string;
  /** URLs de retorno (sucesso / pendente / erro) */
  returnUrls: {
    success: string;
    pending: string;
    failure: string;
  };
};

export type CreatePaymentResult =
  | {
      kind: "redirect";
      /** URL para onde o convidado deve ser enviado */
      url: string;
      /** Identificador externo, quando existir */
      externalId?: string;
    }
  | {
      kind: "pix";
      /** Payload "copia e cola" */
      payload: string;
    }
  | {
      kind: "unavailable";
      reason: string;
    };

export type PaymentDetails = {
  externalId: string;
  status: PaymentStatus;
  amount: number;
  paymentMethod: string | null;
  payerName: string | null;
  giftId: string | null;
};

export type WebhookResult = {
  handled: boolean;
  payment?: PaymentDetails;
  message?: string;
};

export interface PaymentProvider {
  /** Identificador legível do provedor ("payment-link", "mercadopago"...) */
  readonly id: string;

  /** True quando o provedor está pronto para uso (credenciais presentes). */
  isEnabled(): boolean;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  getPayment(externalId: string): Promise<PaymentDetails | null>;

  handleWebhook(request: Request): Promise<WebhookResult>;
}

/** Normaliza os status do Mercado Pago para o nosso vocabulário. */
export function normalizeStatus(raw: string | null | undefined): PaymentStatus {
  switch (raw) {
    case "approved":
      return "approved";
    case "pending":
    case "authorized":
      return "pending";
    case "in_process":
    case "in_mediation":
      return "in_process";
    case "rejected":
      return "rejected";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "cancelled":
      return "cancelled";
    default:
      return "unknown";
  }
}
