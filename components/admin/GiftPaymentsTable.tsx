"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { GiftPaymentRow } from "@/lib/supabase/types";

const methodLabels: Record<string, string> = {
  link: "Link de pagamento",
  pix: "PIX",
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
 * "conferido" depois de bater com o extrato, e abre o comprovante por uma URL
 * assinada e temporária (o bucket é privado).
 */
export function GiftPaymentsTable({ rows }: { rows: GiftPaymentRow[] }) {
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>(
    Object.fromEntries(rows.map((row) => [row.id, row.confirmed])),
  );
  const [busy, setBusy] = useState<string | null>(null);
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

  if (rows.length === 0) {
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

      <div className="overflow-x-auto rounded-lg border border-green-100">
        <table className="w-full min-w-[820px] border-collapse text-sm">
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
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
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
                      checked={confirmed[row.id] ?? false}
                      disabled={busy === row.id}
                      onChange={() => toggleConfirmed(row.id)}
                      className="h-4 w-4 accent-green-700"
                    />
                    <span
                      className={cn(
                        "text-xs uppercase tracking-widest",
                        confirmed[row.id] ? "text-green-700" : "text-ink-muted",
                      )}
                    >
                      {confirmed[row.id] ? "Sim" : "Não"}
                    </span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        Os avisos são declarados pelos próprios convidados. Marque “conferido” depois de encontrar o
        valor no extrato ou no painel do Mercado Pago.
      </p>
    </div>
  );
}
