import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/validations/rsvp";
import { toFieldErrors } from "@/lib/validations";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { checkRateLimit, getClientKey } from "@/lib/utils/rate-limit";
import { sanitizeMultiline, sanitizePhone, sanitizeText } from "@/lib/utils/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/rsvp — grava a confirmação de presença.
 *
 * Proteções: rate limit por IP, honeypot, validação server-side (Zod) e
 * sanitização antes de gravar. A escrita usa a service role key, que só
 * existe no servidor — o navegador nunca fala direto com o banco.
 */
export async function POST(request: Request) {
  // 1. Rate limit — 5 envios por minuto por IP.
  const limit = checkRateLimit(getClientKey(request, "rsvp"), { windowMs: 60_000, max: 5 });
  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // 2. Corpo da requisição
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  // 3. Honeypot — bots preenchem, humanos não.
  if (typeof (payload as { website?: unknown }).website === "string" &&
      (payload as { website: string }).website.trim() !== "") {
    // Respondemos "ok" para não ensinar o bot qual foi o problema.
    return NextResponse.json({ ok: true });
  }

  // 4. Validação
  const parsed = rsvpSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Confira os campos destacados.",
        fieldErrors: toFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // 5. Sanitização
  const record = {
    name: sanitizeText(data.name, 120),
    email: data.email ? sanitizeText(data.email, 160).toLowerCase() : null,
    phone: data.phone ? sanitizePhone(data.phone) : null,
    attending: data.attending,
    adults: data.attending ? data.adults : 0,
    children: data.attending ? data.children : 0,
    companions: data.companions ? sanitizeMultiline(data.companions, 500) : null,
    children_names: data.childrenNames ? sanitizeMultiline(data.childrenNames, 500) : null,
    notes: data.notes ? sanitizeMultiline(data.notes, 1000) : null,
  };

  // 6. Persistência
  if (!isSupabaseAdminConfigured()) {
    // Modo demonstração: o site roda sem Supabase configurado.
    if (process.env.NODE_ENV !== "production") {
      console.info("[RSVP] Supabase não configurado — confirmação recebida:", record);
      return NextResponse.json({ ok: true });
    }

    console.error("[RSVP] SUPABASE_SERVICE_ROLE_KEY ausente em produção.");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Estamos com um problema para registrar sua confirmação. Fale com o casal pelo WhatsApp, por favor.",
      },
      { status: 503 },
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar. Tente novamente em instantes." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("guests").insert(record);

  if (error) {
    console.error("[RSVP] Erro ao gravar no Supabase:", error.message);
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
