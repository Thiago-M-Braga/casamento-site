"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { giftPriceRanges, matchesPriceRange } from "@/config/gifts";
import { cn } from "@/lib/utils/cn";
import { GiftCard } from "./GiftCard";
import { PaymentModal } from "./PaymentModal";
import type { Gift, GiftPriceRange } from "@/types";

type GiftGridProps = {
  gifts: Gift[];
  /** Exibe os botões de filtro por faixa de valor */
  showFilters?: boolean;
  /** Mostra "12 presentes na lista" acima da grade */
  showCount?: boolean;
  className?: string;
};

/**
 * Grade de presentes com filtros por faixa de valor e um único modal de
 * pagamento compartilhado por todos os cards.
 */
export function GiftGrid({
  gifts,
  showFilters = true,
  showCount = false,
  className,
}: GiftGridProps) {
  const [range, setRange] = useState<GiftPriceRange>("todos");
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  const filtered = useMemo(
    () => gifts.filter((gift) => matchesPriceRange(gift.value, range)),
    [gifts, range],
  );

  return (
    <div className={className}>
      {showFilters ? (
        <div className="mb-10 flex flex-col items-center gap-4">
          {/*
            `overflow-x-auto` também recorta na vertical, e o botão cresce no
            hover. O `py-2` reserva essa folga por dentro, e o `-my-2` desfaz o
            espaço extra no layout — o botão cresce sem ser cortado no topo.
          */}
          <div
            role="group"
            aria-label="Filtrar presentes por valor"
            className="no-scrollbar -mx-5 -my-2 flex gap-2.5 overflow-x-auto px-5 py-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
          >
            {giftPriceRanges.map((option) => {
              const active = option.id === range;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRange(option.id)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-full border px-5 py-2.5 text-[0.7rem] uppercase tracking-widest",
                    "transition-[background-color,border-color,color,transform] duration-500 ease-soft",
                    "hover:scale-[1.035] active:scale-[0.985] motion-reduce:hover:scale-100",
                    active
                      ? "border-green-700 bg-green-700 text-beige-50"
                      : "border-green-200 text-ink-soft hover:border-green-400 hover:text-green-800",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {showCount ? (
            <p className="text-xs uppercase tracking-widest text-ink-muted" aria-live="polite">
              {filtered.length === 1
                ? "1 presente"
                : `${filtered.length} presentes`}
              {range !== "todos" ? " nesta faixa" : " na lista"}
            </p>
          ) : null}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          Nenhum presente nessa faixa de valor. Tente outra. 🙂
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((gift, index) => (
            <Reveal as="li" key={gift.id} delay={(index % 3) * 90} className="h-full">
              <GiftCard gift={gift} onPaymentRequest={setSelectedGift} />
            </Reveal>
          ))}
        </ul>
      )}

      <PaymentModal
        open={selectedGift !== null}
        onClose={() => setSelectedGift(null)}
        gift={selectedGift}
      />
    </div>
  );
}
