"use client";

import { useState } from "react";
import { easterEggPhrases, weddingConfig } from "@/config/wedding";
import { cn } from "@/lib/utils/cn";

/**
 * Easter egg discreto: um coraçãozinho que sorteia frases do casal.
 * Não interfere na navegação e desaparece se `features.easterEggs` for false.
 */
export function EasterEgg({ className }: { className?: string }) {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [clicks, setClicks] = useState(0);

  if (!weddingConfig.features.easterEggs || easterEggPhrases.length === 0) return null;

  function reveal() {
    const next = easterEggPhrases[Math.floor(Math.random() * easterEggPhrases.length)] ?? null;
    setPhrase(next);
    setClicks((count) => count + 1);
  }

  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <button
        type="button"
        onClick={reveal}
        aria-label="Revelar um recado do casal"
        className="rounded-full p-2 text-bordo-400 transition-transform duration-300 hover:scale-125 active:scale-95"
      >
        <span aria-hidden="true" className="text-lg">
          ❤
        </span>
      </button>

      <p role="status" aria-live="polite" className="min-h-5 max-w-sm text-xs italic text-ink-muted">
        {phrase}
        {clicks >= 4 ? " (tá bom, já deu.)" : ""}
      </p>
    </div>
  );
}
