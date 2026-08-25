import { PaymentLinkProvider } from "./link-provider";
import { MercadoPagoProvider } from "./mercadopago-provider";
import type { PaymentProvider } from "./provider";

export * from "./provider";
export { PaymentLinkProvider } from "./link-provider";
export { MercadoPagoProvider } from "./mercadopago-provider";

const mercadoPago = new MercadoPagoProvider();
const paymentLink = new PaymentLinkProvider();

/**
 * Escolhe o provedor ativo.
 * Mercado Pago quando configurado; caso contrário, links + PIX.
 */
export function getPaymentProvider(): PaymentProvider {
  return mercadoPago.isEnabled() ? mercadoPago : paymentLink;
}

export function getMercadoPagoProvider(): MercadoPagoProvider {
  return mercadoPago;
}
