import { buildPixPayload, isPixConfigured } from "@/lib/utils/pix";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentDetails,
  PaymentProvider,
  WebhookResult,
} from "./provider";

/**
 * Provedor da PRIMEIRA VERSÃO.
 *
 * - Se o presente tem `paymentUrl`, redireciona para esse link (reutilizável
 *   por vários convidados — não criamos link por pessoa).
 * - Caso contrário, devolve o payload PIX para o modal.
 *
 * Não há consulta de status nem webhook: o acompanhamento é feito no extrato
 * do banco / painel do Mercado Pago.
 */
export class PaymentLinkProvider implements PaymentProvider {
  readonly id = "payment-link";

  isEnabled(): boolean {
    return true;
  }

  async createPayment({ gift, amount }: CreatePaymentInput): Promise<CreatePaymentResult> {
    const url = gift.paymentUrl?.trim();

    if (url) {
      return { kind: "redirect", url };
    }

    if (isPixConfigured()) {
      return {
        kind: "pix",
        payload: buildPixPayload({ amount: amount ?? gift.value, reference: gift.id }),
      };
    }

    return {
      kind: "unavailable",
      reason:
        "Este presente ainda não tem forma de pagamento configurada. Fale com o casal pelo WhatsApp.",
    };
  }

  async getPayment(): Promise<PaymentDetails | null> {
    return null;
  }

  async handleWebhook(): Promise<WebhookResult> {
    return { handled: false, message: "Provedor de links não recebe webhooks." };
  }
}
