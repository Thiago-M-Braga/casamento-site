import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { GUEST_PHOTO_BUCKET } from "@/lib/guest-photos/storage";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Todas as rotas deste arquivo exigem sessão de admin. */
async function requireAdmin() {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
}

/**
 * PATCH /api/admin/guest-photos — mostra ou esconde uma foto de convidado.
 * Body: { id: string, approved: boolean }
 *
 * É o botão de emergência do casal durante a festa: com um clique a foto sai
 * da galeria pública, sem precisar apagar nada.
 */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as
    | { id?: string; approved?: boolean }
    | null;

  if (!body?.id || typeof body.approved !== "boolean") {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado." }, { status: 503 });
  }

  const { error } = await supabase
    .from("guest_photos")
    .update({ approved: body.approved })
    .eq("id", body.id);

  if (error) {
    console.error("[ADMIN] Erro ao atualizar foto:", error.message);
    return NextResponse.json({ ok: false, error: "Não foi possível salvar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/admin/guest-photos — apaga uma foto de convidado de vez.
 * Body: { id: string }
 *
 * Remove o arquivo do bucket e o registro. Diferente dos presentes, aqui não
 * existe travo de "já conferido": foto que o casal não quer no álbum não
 * deveria continuar ocupando espaço.
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

  // Lê antes de apagar: precisamos do caminho do arquivo no Storage.
  const { data: row, error: readError } = await supabase
    .from("guest_photos")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("[ADMIN] Erro ao buscar foto:", readError.message);
    return NextResponse.json({ ok: false, error: "Não foi possível excluir." }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ ok: false, error: "Foto não encontrada." }, { status: 404 });
  }

  // Caminho relativo suspeito nunca deveria existir (quem grava é a nossa
  // rota), mas conferir aqui é barato e evita apagar fora do bucket.
  if (row.storage_path && !row.storage_path.includes("..")) {
    const { error: storageError } = await supabase.storage
      .from(GUEST_PHOTO_BUCKET)
      .remove([row.storage_path]);

    // Arquivo órfão é menos ruim do que um registro que o casal não consegue
    // remover — então seguimos e apagamos a linha de qualquer forma.
    if (storageError) {
      console.warn("[ADMIN] Arquivo da foto não removido:", storageError.message);
    }
  }

  const { error: deleteError } = await supabase.from("guest_photos").delete().eq("id", id);

  if (deleteError) {
    console.error("[ADMIN] Erro ao excluir foto:", deleteError.message);
    return NextResponse.json({ ok: false, error: "Não foi possível excluir." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
