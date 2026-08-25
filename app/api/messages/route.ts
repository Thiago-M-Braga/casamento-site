import { NextResponse } from "next/server";
import { guestMessageSchema } from "@/lib/validations/message";
import { toFieldErrors } from "@/lib/validations";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { checkRateLimit, getClientKey } from "@/lib/utils/rate-limit";
import { looksLikeSpam, sanitizeMultiline, sanitizeText } from "@/lib/utils/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/messages — grava a mensagem do convidado com `approved = false`.
 * Nada é publicado no site antes da moderação do casal.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(getClientKey(request, "messages"), { windowMs: 60_000, max: 4 });
  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Calma lá! Aguarde um instante antes de enviar outra mensagem." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot
  if (typeof (payload as { website?: unknown }).website === "string" &&
      (payload as { website: string }).website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = guestMessageSchema.safeParse(payload);
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

  const guestName = sanitizeText(parsed.data.guestName, 80);
  const message = sanitizeMultiline(parsed.data.message, 600);

  // Filtro simples de spam (links, caixa alta excessiva)
  if (looksLikeSpam(message) || looksLikeSpam(guestName)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Sua mensagem parece conter links. Escreva sem links, por favor. 🙂",
        fieldErrors: { message: ["Remova links da mensagem."] },
      },
      { status: 422 },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[MENSAGEM] Supabase não configurado — mensagem recebida:", {
        guestName,
        message,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar agora. Tente novamente mais tarde." },
      { status: 503 },
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar agora. Tente novamente mais tarde." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("guest_messages").insert({
    guest_name: guestName,
    message,
    approved: false,
  });

  if (error) {
    console.error("[MENSAGEM] Erro ao gravar no Supabase:", error.message);
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
