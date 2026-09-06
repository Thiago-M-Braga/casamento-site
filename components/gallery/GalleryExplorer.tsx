"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { GalleryPhoto } from "@/types";
import { Gallery } from "./Gallery";

type Filter = "todas" | "casal" | "convidados";

type GalleryExplorerProps = {
  /** Fotos escolhidas pelo casal (`galleryImages` em config/wedding.ts). */
  curated: GalleryPhoto[];
  /** Fotos enviadas pelos convidados, das mais recentes para as mais antigas. */
  guest: GalleryPhoto[];
};

/**
 * A galeria com dois acervos no mesmo lugar.
 *
 * Depois do casamento a página passa a ter duas origens de foto bem diferentes:
 * o ensaio do casal e o que os convidados registraram na festa. Misturar tudo
 * sem aviso confunde; separar em duas páginas quebra a navegação do
 * visualizador. O meio do caminho é este filtro — que só aparece quando existe
 * de fato o que filtrar.
 *
 * As fotos dos convidados vêm primeiro em "Todas": no dia da festa, elas são a
 * novidade que a pessoa abriu a página para ver.
 */
export function GalleryExplorer({ curated, guest }: GalleryExplorerProps) {
  const [filter, setFilter] = useState<Filter>("todas");

  const hasGuestPhotos = guest.length > 0;

  const visible = useMemo(() => {
    if (!hasGuestPhotos) return curated;
    if (filter === "casal") return curated;
    if (filter === "convidados") return guest;
    return [...guest, ...curated];
  }, [curated, filter, guest, hasGuestPhotos]);

  const options: { value: Filter; label: string; count: number }[] = [
    { value: "todas", label: "Todas", count: guest.length + curated.length },
    { value: "convidados", label: "Dos convidados", count: guest.length },
    { value: "casal", label: "Nosso ensaio", count: curated.length },
  ];

  return (
    <div>
      {hasGuestPhotos ? (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {options.map((option) => {
            const active = filter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2",
                  "font-body text-[0.7rem] uppercase tracking-widest",
                  "transition-colors duration-300 ease-soft",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordo-300/60",
                  active
                    ? "border-green-500 bg-green-500 text-beige-50"
                    : "border-green-200 bg-beige-50 text-green-700 hover:border-green-400 hover:bg-green-50",
                )}
              >
                {option.label}
                <span className={cn("tabular", active ? "text-beige-200" : "text-ink-muted")}>
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {visible.length > 0 ? (
        <Gallery images={visible} />
      ) : (
        <p className="py-16 text-center text-sm text-ink-muted">
          Nenhuma foto por aqui ainda.
        </p>
      )}

      {/* Anuncia a troca de filtro para quem usa leitor de tela. */}
      <p className="sr-only" role="status">
        {visible.length} {visible.length === 1 ? "foto" : "fotos"} sendo exibidas.
      </p>
    </div>
  );
}
