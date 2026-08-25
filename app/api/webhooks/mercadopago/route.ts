import { NextResponse } from "next/server";
import { getMercadoPagoProvider } from "@/lib/mercadopago";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/mercadopago
 *
 * Recebe as notificações do Mercado Pago, consulta o pagamento na API oficial
 * (nunca confia no corpo da notificação) e registra/atualiza a linha em
 * `payments`. Responde 200 mesmo quando ignora, para o Mercado Pago não
 * reenviar indefinidamente.
 */
export async function POST(request: Request) {
  const provider = getMercadoPagoProvider();

  if (!provider.isEnabled()) {
    return NextResponse.json({ ok: true, ignored: "mercadopago-desativado" });
  }

  let result;
  try {
    result = await provider.handleWebhook(request);
  } catch (error) {
    console.error("[WEBHOOK] Falha ao processar notificação:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (!result.handled || !result.payment) {
    return NextResponse.json({ ok: true, ignored: result.message ?? "sem-acao" });
  }

  const payment = result.payment;
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    // Sem banco configurado, ao menos deixamos o registro no log da Vercel.
    console.info("[WEBHOOK] Pagamento recebido (sem Supabase):", payment);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase
    .from("payments")
    .upsert(
      {
        gift_id: payment.giftId,
        external_payment_id: payment.externalId,
        payer_name: payment.payerName,
        amount: payment.amount,
        status: payment.status,
        payment_method: payment.paymentMethod,
      },
      { onConflict: "external_payment_id" },
    );

  if (error) {
    console.error("[WEBHOOK] Erro ao gravar pagamento:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}

/** O Mercado Pago pode validar a URL com um GET. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
