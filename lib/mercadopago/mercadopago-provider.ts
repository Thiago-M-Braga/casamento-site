import { weddingConfig } from "@/config/wedding";
import { absoluteUrl } from "@/lib/utils/site";
import {
  normalizeStatus,
  type CreatePaymentInput,
  type CreatePaymentResult,
  type PaymentDetails,
  type PaymentProvider,
  type WebhookResult,
} from "./provider";

const API_BASE = "https://api.mercadopago.com";

type PreferenceResponse = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  message?: string;
};

type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  transaction_amount?: number;
  payment_method_id?: string;
  external_reference?: string;
  payer?: { first_name?: string; last_name?: string; email?: string };
};

/**
 * Integração oficial via Checkout Pro (página hospedada pelo Mercado Pago,
 * com retorno para o site). O access token fica exclusivamente no servidor.
 *
 * Para ativar:
 *   1. weddingConfig.payments.mercadoPagoEnabled = true
 *   2. MERCADOPAGO_ACCESS_TOKEN no .env.local / Vercel
 */
export class MercadoPagoProvider implements PaymentProvider {
  readonly id = "mercadopago";

  private get accessToken(): string {
    return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? "";
  }

  isEnabled(): boolean {
    return weddingConfig.payments.mercadoPagoEnabled && Boolean(this.accessToken);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const body = (await response.json().catch(() => ({}))) as T & { message?: string };

    if (!response.ok) {
      throw new Error(body?.message || `Mercado Pago respondeu ${response.status}`);
    }

    return body;
  }

  async createPayment({
    gift,
    amount,
    payerName,
    payerEmail,
    returnUrls,
  }: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.isEnabled()) {
      return { kind: "unavailable", reason: "Mercado Pago não está configurado." };
    }

    const unitPrice = amount && amount > 0 ? amount : gift.value;

    try {
      const preference = await this.request<PreferenceResponse>("/checkout/preferences", {
        method: "POST",
        body: JSON.stringify({
          items: [
            {
              id: gift.id,
              title: `${gift.title} — ${weddingConfig.couple.displayName}`,
              description: gift.description.slice(0, 250),
              quantity: 1,
              currency_id: "BRL",
              unit_price: unitPrice,
            },
          ],
          payer: payerName || payerEmail ? { name: payerName, email: payerEmail } : undefined,
          external_reference: gift.id,
          statement_descriptor: "CASAMENTO",
          back_urls: {
            success: returnUrls.success,
            pending: returnUrls.pending,
            failure: returnUrls.failure,
          },
          auto_return: "approved",
          notification_url: absoluteUrl("/api/webhooks/mercadopago"),
        }),
      });

      const url = preference.init_point ?? preference.sandbox_init_point;
      if (!url) {
        return { kind: "unavailable", reason: "Não foi possível criar o checkout." };
      }

      return { kind: "redirect", url, externalId: preference.id };
    } catch (error) {
      return {
        kind: "unavailable",
        reason: error instanceof Error ? error.message : "Erro ao falar com o Mercado Pago.",
      };
    }
  }

  async getPayment(externalId: string): Promise<PaymentDetails | null> {
    if (!this.isEnabled()) return null;

    try {
      const payment = await this.request<MercadoPagoPayment>(`/v1/payments/${externalId}`);
      return this.toDetails(payment);
    } catch {
      return null;
    }
  }

  async handleWebhook(request: Request): Promise<WebhookResult> {
    if (!this.isEnabled()) {
      return { handled: false, message: "Mercado Pago não está configurado." };
    }

    const body = (await request.json().catch(() => null)) as
      | { type?: string; action?: string; data?: { id?: string | number } }
      | null;

    const paymentId = body?.data?.id;
    const topic = body?.type ?? body?.action ?? "";

    if (!paymentId || !topic.includes("payment")) {
      return { handled: false, message: "Notificação ignorada." };
    }

    const payment = await this.getPayment(String(paymentId));
    if (!payment) return { handled: false, message: "Pagamento não encontrado." };

    return { handled: true, payment };
  }

  private toDetails(payment: MercadoPagoPayment): PaymentDetails {
    const payerName = [payment.payer?.first_name, payment.payer?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      externalId: String(payment.id ?? ""),
      status: normalizeStatus(payment.status),
      amount: payment.transaction_amount ?? 0,
      paymentMethod: payment.payment_method_id ?? null,
      payerName: payerName || payment.payer?.email || null,
      giftId: payment.external_reference ?? null,
    };
  }
}
