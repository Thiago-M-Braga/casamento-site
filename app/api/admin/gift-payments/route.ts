import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECEIPT_BUCKET = "comprovantes";
/** Validade da URL do comprovante: o suficiente para abrir e conferir. */
const SIGNED_URL_TTL_SECONDS = 300;

/** Todas as rotas deste arquivo exigem sessão de admin. */
async function requireAdmin() {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
}

/**
 * PATCH /api/admin/gift-payments — marca/desmarca um presente como conferido.
 * Body: { id: string, confirmed: boolean }
 */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as
    | { id?: string; confirmed?: boolean }
    | null;

  if (!body?.id || typeof body.confirmed !== "boolean") {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado." }, { status: 503 });
  }

  const { error } = await supabase
    .from("gift_payments")
    .update({ confirmed: body.confirmed })
    .eq("id", body.id);

  if (error) {
    console.error("[ADMIN] Erro ao atualizar presente:", error.message);
    return NextResponse.json({ ok: false, error: "Não foi possível salvar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * POST /api/admin/gift-payments — gera uma URL assinada e temporária para ver
 * o comprovante. O bucket é privado, então o caminho sozinho não abre nada.
 * Body: { path: string }
 */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  const path = body?.path?.trim();

  // Bloqueia tentativa de sair do bucket por caminho relativo.
  if (!path || path.includes("..")) {
    return NextResponse.json({ ok: false, error: "Caminho inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado." }, { status: 503 });
  }

  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[ADMIN] Erro ao assinar comprovante:", error?.message);
    return NextResponse.json(
      { ok: false, error: "Não foi possível abrir o comprovante." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data: { url: data.signedUrl } });
}
