import { NextResponse } from "next/server";
import { getGiftById } from "@/config/gifts";
import { getPaymentProvider } from "@/lib/mercadopago";
import { absoluteUrl } from "@/lib/utils/site";
import { checkRateLimit, getClientKey } from "@/lib/utils/rate-limit";
import { sanitizeText } from "@/lib/utils/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments — inicia o pagamento de um presente.
 *
 * A rota conversa apenas com a abstração `PaymentProvider`, então trocar
 * "link externo" por "Checkout do Mercado Pago" não muda nada aqui nem no
 * frontend. Credenciais ficam exclusivamente no servidor.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(getClientKey(request, "payments"), { windowMs: 60_000, max: 12 });
  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Aguarde um instante." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { giftId?: string; amount?: number; payerName?: string; payerEmail?: string }
    | null;

  const giftId = body?.giftId?.trim();
  if (!giftId) {
    return NextResponse.json({ ok: false, error: "Presente não informado." }, { status: 400 });
  }

  const gift = getGiftById(giftId);
  if (!gift || !gift.active) {
    return NextResponse.json({ ok: false, error: "Presente não encontrado." }, { status: 404 });
  }

  // Valor customizado é aceito, mas nunca abaixo de R$ 5 (evita abuso).
  const amount =
    typeof body?.amount === "number" && body.amount >= 5 ? body.amount : gift.value;

  const provider = getPaymentProvider();

  const result = await provider.createPayment({
    gift,
    amount,
    payerName: body?.payerName ? sanitizeText(body.payerName, 120) : undefined,
    payerEmail: body?.payerEmail ? sanitizeText(body.payerEmail, 160) : undefined,
    returnUrls: {
      success: absoluteUrl("/agradecimento"),
      pending: absoluteUrl("/pagamento/pendente"),
      failure: absoluteUrl("/pagamento/erro"),
    },
  });

  if (result.kind === "unavailable") {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 503 });
  }

  return NextResponse.json({ ok: true, data: result });
}
