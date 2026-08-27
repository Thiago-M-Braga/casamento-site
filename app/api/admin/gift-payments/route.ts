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

/**
 * DELETE /api/admin/gift-payments — remove um aviso de presente.
 * Body: { id: string }
 *
 * Só apaga registros AINDA NÃO CONFERIDOS: uma vez que o casal confirmou o
 * recebimento, o histórico fica protegido contra remoção acidental. O
 * comprovante no Storage também é apagado, para não deixar arquivo órfão.
 */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id?.trim();

  if (!id) {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado." }, { status: 503 });
  }

  // Lê o registro antes de apagar: precisamos do comprovante e do status.
  const { data: row, error: readError } = await supabase
    .from("gift_payments")
    .select("id, confirmed, receipt_path")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("[ADMIN] Erro ao buscar presente:", readError.message);
    return NextResponse.json({ ok: false, error: "Não foi possível excluir." }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ ok: false, error: "Presente não encontrado." }, { status: 404 });
  }

  // Regra de negócio: presente conferido não pode ser apagado.
  if (row.confirmed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Este presente já foi conferido. Desmarque antes de excluir.",
      },
      { status: 409 },
    );
  }

  // Apaga o comprovante primeiro. Se falhar, seguimos mesmo assim — um arquivo
  // órfão é menos ruim do que um registro que o casal não consegue remover.
  if (row.receipt_path) {
    const { error: storageError } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .remove([row.receipt_path]);

    if (storageError) {
      console.warn("[ADMIN] Comprovante não removido:", storageError.message);
    }
  }

  const { error: deleteError } = await supabase
    .from("gift_payments")
    .delete()
    .eq("id", id)
    // Rede de segurança: garante no banco que só apagamos o não conferido,
    // mesmo que o status tenha mudado entre a leitura e a exclusão.
    .eq("confirmed", false);

  if (deleteError) {
    console.error("[ADMIN] Erro ao excluir presente:", deleteError.message);
    return NextResponse.json({ ok: false, error: "Não foi possível excluir." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
