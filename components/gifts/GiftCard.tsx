"use client";

import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { PaymentButton } from "./PaymentButton";
import type { Gift } from "@/types";

type GiftCardProps = {
  gift: Gift;
  onPaymentRequest: (gift: Gift) => void;
  className?: string;
};

export function GiftCard({ gift, onPaymentRequest, className }: GiftCardProps) {
  // Presente misterioso: a descrição só aparece depois do clique (easter egg).
  const [revealed, setRevealed] = useState(!gift.mystery);

  return (
    <article
      className={cn(
        "surface group/card flex h-full flex-col overflow-hidden transition-shadow duration-500 ease-soft hover:shadow-card",
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={gift.image}
          alt={gift.title}
          className="aspect-[4/3] w-full"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 340px"
        />

        {gift.emoji ? (
          <span
            aria-hidden="true"
            className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-beige-50/95 text-xl shadow-soft backdrop-blur"
          >
            {gift.emoji}
          </span>
        ) : null}

        <span className="absolute bottom-4 right-4 rounded-full bg-green-800/90 px-3.5 py-1.5 text-xs font-medium tracking-wide text-beige-50 backdrop-blur">
          {formatCurrency(gift.value)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="text-xl leading-snug md:text-[1.35rem]">{gift.title}</h3>

        {revealed ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{gift.description}</p>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-3 flex-1 text-left text-sm italic leading-relaxed text-bordo-600 underline decoration-dotted underline-offset-4"
          >
            Toque para descobrir o que é...
          </button>
        )}

        <div className="mt-6">
          <PaymentButton gift={gift} onPaymentRequest={onPaymentRequest} variant="primary" fullWidth />
        </div>
      </div>
    </article>
  );
}
