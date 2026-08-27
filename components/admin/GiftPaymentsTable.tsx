"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { GiftPaymentRow } from "@/lib/supabase/types";

const methodLabels: Record<string, string> = {
  // 'link' é o valor gravado no banco desde o começo; o rótulo acompanha o
  // provedor atual (PagBank) sem exigir migração de dados.
  link: "PagBank",
  pix: "PIX direto",
  outro: "Outro",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/**
 * Lista de presentes comprados.
 *
 * Cada linha vem de um aviso enviado pelo próprio convidado. O casal marca
 * "conferido" depois de bater com o extrato, abre o comprovante por uma URL
 * assinada e temporária (o bucket é privado), e pode excluir avisos que ainda
 * não foram conferidos (úteis para descartar testes).
 */
export function GiftPaymentsTable({ rows }: { rows: GiftPaymentRow[] }) {
  // Guardamos as linhas em estado para poder removê-las da tela após excluir.
  const [items, setItems] = useState<GiftPaymentRow[]>(rows);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>(
    Object.fromEntries(rows.map((row) => [row.id, row.confirmed])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GiftPaymentRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleConfirmed(id: string) {
    const next = !confirmed[id];
    setBusy(id);
    setError(null);

    // Atualiza na hora e desfaz se o servidor recusar.
    setConfirmed((current) => ({ ...current, [id]: next }));

    try {
      const response = await fetch("/api/admin/gift-payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, confirmed: next }),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!result.ok) {
        setConfirmed((current) => ({ ...current, [id]: !next }));
        setError(result.error ?? "Não foi possível salvar.");
      }
    } catch {
      setConfirmed((current) => ({ ...current, [id]: !next }));
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function openReceipt(path: string) {
    setError(null);

    try {
      const response = await fetch("/api/admin/gift-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      const result = (await response.json()) as
        | { ok: true; data: { url: string } }
        | { ok: false; error: string };

      if (!result.ok) {
        setError(result.error);
        return;
      }

      window.open(result.data.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Não foi possível abrir o comprovante.");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;

    setDeleting(id);
    setError(null);

    try {
      const response = await fetch("/api/admin/gift-payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!result.ok) {
        setError(result.error ?? "Não foi possível excluir.");
        return;
      }

      // Remove da tela sem recarregar a página inteira.
      setItems((current) => current.filter((row) => row.id !== id));
      setPendingDelete(null);
    } catch {
      setError("Não foi possível excluir. Tente novamente.");
    } finally {
      setDeleting(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Nenhum presente registrado ainda. Os avisos que os convidados enviarem aparecem aqui.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="scrollbar-thin overflow-x-auto rounded-lg border border-green-100">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <caption className="sr-only">Presentes comprados pelos convidados</caption>
          <thead className="bg-beige-200/60 text-left text-xs uppercase tracking-widest text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Quando</th>
              <th scope="col" className="px-4 py-3 font-medium">Presente</th>
              <th scope="col" className="px-4 py-3 font-medium">Quem</th>
              <th scope="col" className="px-4 py-3 font-medium">Valor</th>
              <th scope="col" className="px-4 py-3 font-medium">Forma</th>
              <th scope="col" className="px-4 py-3 font-medium">Comprovante</th>
              <th scope="col" className="px-4 py-3 font-medium">Conferido</th>
              <th scope="col" className="px-4 py-3 font-medium">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const isConfirmed = confirmed[row.id] ?? false;

              return (
                <tr key={row.id} className="border-t border-green-100 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                    {formatDate(row.created_at)}
                  </td>

                  <td className="px-4 py-3 font-medium text-green-800">
                    {row.gift_title ?? row.gift_id ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {row.anonymous ? (
                      <span className="rounded-full bg-beige-200 px-2.5 py-1 text-[0.65rem] uppercase tracking-widest text-ink-soft">
                        Anônimo
                      </span>
                    ) : (
                      (row.payer_name ?? "—")
                    )}

                    {row.message ? (
                      <span className="mt-1.5 block whitespace-pre-line text-xs italic text-ink-muted">
                        “{row.message}”
                      </span>
                    ) : null}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 tabular">
                    {Number(row.amount) > 0 ? formatCurrency(Number(row.amount)) : "livre"}
                  </td>

                  <td className="px-4 py-3 text-ink-soft">
                    {methodLabels[row.method] ?? row.method}
                  </td>

                  <td className="px-4 py-3">
                    {row.receipt_path ? (
                      <button
                        type="button"
                        onClick={() => openReceipt(row.receipt_path!)}
                        className="link-underline text-sm font-medium text-green-800"
                      >
                        Ver arquivo
                      </button>
                    ) : (
                      <span className="text-xs text-ink-muted">não enviou</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isConfirmed}
                        disabled={busy === row.id}
                        onChange={() => toggleConfirmed(row.id)}
                        className="h-4 w-4 accent-green-700"
                      />
                      <span
                        className={cn(
                          "text-xs uppercase tracking-widest",
                          isConfirmed ? "text-green-700" : "text-ink-muted",
                        )}
                      >
                        {isConfirmed ? "Sim" : "Não"}
                      </span>
                    </label>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {/* Excluir só faz sentido para o que ainda não foi conferido:
                        depois de confirmado, o histórico fica protegido. */}
                    {isConfirmed ? (
                      <span className="text-xs text-ink-muted" title="Desmarque para poder excluir">
                        —
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setPendingDelete(row);
                        }}
                        disabled={deleting === row.id}
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Excluir aviso de ${row.anonymous ? "convidado anônimo" : (row.payer_name ?? "convidado")}`}
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        Os avisos são declarados pelos próprios convidados. Marque “conferido” depois de encontrar o
        valor no extrato ou no painel do PagBank. Você pode excluir avisos ainda não conferidos —
        útil para descartar testes.
      </p>

      {pendingDelete ? (
        <DeleteConfirm
          row={pendingDelete}
          deleting={deleting === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}

/**
 * Confirmação de exclusão. Diálogo simples e acessível (fecha no Esc e no
 * clique fora); não reusa o Modal do site para manter o painel independente.
 */
function DeleteConfirm({
  row,
  deleting,
  onCancel,
  onConfirm,
}: {
  row: GiftPaymentRow;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const who = row.anonymous ? "convidado anônimo" : (row.payer_name ?? "convidado");
  const gift = row.gift_title ?? row.gift_id ?? "presente";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-green-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="excluir-titulo"
      onKeyDown={(event) => {
        if (event.key === "Escape") onCancel();
      }}
    >
      <button
        type="button"
        aria-label="Cancelar"
        className="absolute inset-0 h-full w-full cursor-default"
        tabIndex={-1}
        onClick={onCancel}
      />

      <div className="relative w-full max-w-sm animate-scale-in rounded-t-2xl bg-beige-50 p-6 shadow-lift sm:rounded-2xl">
        <h3 id="excluir-titulo" className="font-display text-xl font-light text-green-800">
          Excluir este aviso?
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          O aviso de <strong className="font-medium text-green-800">{who}</strong> para “{gift}”
          será apagado, junto com o comprovante, se houver. Não dá para desfazer.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-full bg-red-700 px-6 py-3 text-xs uppercase tracking-widest text-beige-50 transition-colors hover:bg-red-800 disabled:opacity-60"
          >
            {deleting ? "Excluindo..." : "Sim, excluir"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-full border border-green-300 px-6 py-3 text-xs uppercase tracking-widest text-green-800 transition-colors hover:bg-green-700 hover:text-beige-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
