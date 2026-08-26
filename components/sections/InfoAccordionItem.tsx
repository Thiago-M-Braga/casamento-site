"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";

type InfoItem = {
  icon: string;
  title: string;
  description: string;
  details: readonly string[];
};

/**
 * Item das informações úteis.
 *
 * Trocamos o `<details>` nativo por um acordeão controlado porque o nativo não
 * anima a abertura. A animação usa o truque de `grid-template-rows: 0fr → 1fr`:
 * o navegador interpola a altura sozinho, sem precisar medir nada em JS, e
 * continua funcionando se o texto quebrar em mais linhas no celular.
 *
 * O fundo do hover fica no card inteiro (não só no cabeçalho), então abrir o
 * item não deixa metade verde e metade bege.
 */
export function InfoAccordionItem({ item }: { item: InfoItem }) {
  const [open, setOpen] = useState(false);
  const panelId = `${useId()}-detalhes`;
  const hasDetails = item.details.length > 0;

  return (
    <article
      className={cn(
        "surface overflow-hidden transition-colors duration-500 ease-soft",
        hasDetails && "hover:bg-green-100",
        open && "bg-green-100/60",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={hasDetails ? open : undefined}
        aria-controls={hasDetails ? panelId : undefined}
        disabled={!hasDetails}
        className={cn(
          "flex w-full items-center gap-4 p-5 text-left md:p-6",
          hasDetails ? "cursor-pointer" : "cursor-default",
        )}
      >
        <span aria-hidden="true" className="text-2xl">
          {item.icon}
        </span>

        <span className="flex-1">
          <span className="block font-display text-xl text-green-800">{item.title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
            {item.description}
          </span>
        </span>

        {hasDetails ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 text-bordo-500 transition-transform duration-500 ease-soft",
              open && "rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </button>

      {hasDetails ? (
        <div
          id={panelId}
          aria-hidden={!open}
          className={cn(
            "grid transition-[grid-template-rows] duration-500 ease-soft",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <ul
              className={cn(
                "space-y-2 border-t border-green-200/70 px-5 py-5 text-sm leading-relaxed text-ink-soft md:px-6",
                "transition-opacity duration-500 ease-soft",
                open ? "opacity-100 delay-100" : "opacity-0",
              )}
            >
              {item.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bordo-400"
                  />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}
