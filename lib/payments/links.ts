import { weddingConfig } from "@/config/wedding";
import { isPixConfigured } from "@/lib/utils/pix";
import type { Gift } from "@/types";

/**
 * PAGAMENTO POR LINK (PagBank)
 * ---------------------------------------------------------------------------
 * Cada presente tem o seu link do PagBank em `config/gifts.ts` → `paymentUrl`.
 * O convidado escolhe a forma de pagamento (cartão, PIX ou boleto) dentro da
 * página do PagBank, então o site não precisa de credencial, API nem webhook.
 *
 * Se um dia o casal quiser a integração via API do PagBank (para saber
 * automaticamente quem pagou), o ponto de troca é este arquivo: mantenha
 * `getGiftPaymentUrl` e acrescente a criação de cobrança no servidor.
 */

/** Link de pagamento de um presente: o dele, ou o link geral como reserva. */
export function getGiftPaymentUrl(gift: Gift | null): string {
  const own = gift?.paymentUrl?.trim();
  if (own) return own;

  return weddingConfig.payments.pagbankLink?.trim() ?? "";
}

/** True quando existe algum link configurado para este presente. */
export function hasPaymentLink(gift: Gift | null): boolean {
  return Boolean(getGiftPaymentUrl(gift));
}

/** True quando o PIX direto está ligado E a chave foi preenchida. */
export function isPixAvailable(): boolean {
  return weddingConfig.payments.pixEnabled && isPixConfigured();
}

/** Quantos presentes ativos ainda estão sem link — útil para avisar o casal. */
export function countGiftsWithoutLink(gifts: Gift[]): number {
  return gifts.filter((gift) => !gift.paymentUrl?.trim()).length;
}
