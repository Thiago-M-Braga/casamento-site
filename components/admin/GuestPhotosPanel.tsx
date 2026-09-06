"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { AdminGuestPhoto } from "@/types";

type GuestPhotosPanelProps = {
  photos: AdminGuestPhoto[];
};

/**
 * Moderação das fotos enviadas pelos convidados.
 *
 * Dois níveis de ação, de propósito:
 *  - "Esconder" tira a foto da galeria pública na hora e é reversível. É o
 *    botão para usar durante a festa, sem pensar duas vezes.
 *  - "Excluir" apaga o arquivo e o registro para sempre, e por isso pede
 *    confirmação.
 *
 * O estado é otimista (a tela muda antes da resposta) e volta atrás se a
 * requisição falhar: no meio do casamento, esperar o servidor para ver o
 * clique acontecer seria frustrante.
 */
export function GuestPhotosPanel({ photos }: GuestPhotosPanelProps) {
  const [items, setItems] = useState(photos);
  const [busy, setBusy] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleApproved(photo: AdminGuestPhoto) {
    const next = !photo.approved;

    setBusy(photo.id);
    setError(null);
    setItems((current) =>
      current.map((item) => (item.id === photo.id ? { ...item, approved: next } : item)),
    );

    try {
      const response = await fetch("/api/admin/guest-photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id, approved: next }),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!result.ok) {
        // Desfaz a mudança otimista.
        setItems((current) =>
          current.map((item) =>
            item.id === photo.id ? { ...item, approved: photo.approved } : item,
          ),
        );
        setError(result.error ?? "Não foi possível salvar.");
      }
    } catch {
      setItems((current) =>
        current.map((item) => (item.id === photo.id ? { ...item, approved: photo.approved } : item)),
      );
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(photo: AdminGuestPhoto) {
    setBusy(photo.id);
    setError(null);

    try {
      const response = await fetch("/api/admin/guest-photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id }),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (result.ok) {
        setItems((current) => current.filter((item) => item.id !== photo.id));
        setPendingDelete(null);
      } else {
        setError(result.error ?? "Não foi possível excluir.");
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">Nenhuma foto enviada pelos convidados ainda.</p>;
  }

  return (
    <div>
      {error ? (
        <p role="alert" className="mb-4 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((photo) => {
          const working = busy === photo.id;
          const confirming = pendingDelete === photo.id;

          return (
            <li key={photo.id} className="surface overflow-hidden">
              <div className="relative aspect-square bg-beige-200">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? `Foto enviada por ${photo.guestName ?? "convidado"}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 260px"
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    !photo.approved && "opacity-40",
                  )}
                />

                {!photo.approved ? (
                  <span className="absolute left-2 top-2 rounded-full bg-bordo-600 px-2.5 py-1 text-[0.6rem] uppercase tracking-widest text-beige-50">
                    Escondida
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 p-3">
                <p className="truncate text-sm font-medium text-green-800">
                  {photo.guestName ?? "Anônimo"}
                </p>

                {photo.caption ? (
                  <p className="line-clamp-2 text-xs leading-relaxed text-ink-soft">
                    {photo.caption}
                  </p>
                ) : null}

                <p className="text-[0.65rem] uppercase tracking-widest text-ink-muted">
                  {new Date(photo.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <div className="mt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => void toggleApproved(photo)}
                    className="rounded-full border border-green-300 px-3 py-1.5 text-[0.65rem] uppercase tracking-widest text-green-700 transition-colors hover:border-green-400 hover:bg-green-50 disabled:opacity-50"
                  >
                    {photo.approved ? "Esconder" : "Mostrar"}
                  </button>

                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-green-200 px-3 py-1.5 text-[0.65rem] uppercase tracking-widest text-ink-soft transition-colors hover:bg-beige-200"
                  >
                    Abrir
                  </a>

                  {confirming ? (
                    <>
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => void remove(photo)}
                        className="rounded-full bg-red-700 px-3 py-1.5 text-[0.65rem] uppercase tracking-widest text-beige-50 transition-colors hover:bg-red-800 disabled:opacity-50"
                      >
                        {working ? "Excluindo..." : "Confirmar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(null)}
                        className="rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-widest text-ink-muted transition-colors hover:text-ink"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => {
                        setError(null);
                        setPendingDelete(photo.id);
                      }}
                      className="rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-widest text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
