"use client";

import { useEffect, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { getCountdownParts, type CountdownParts } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

type CountdownProps = {
  /** Variação clara (sobre foto/hero escuro) ou escura (sobre fundo creme) */
  tone?: "light" | "dark";
  className?: string;
};

const units: { key: keyof Omit<CountdownParts, "finished">; label: string }[] = [
  { key: "days", label: "dias" },
  { key: "hours", label: "horas" },
  { key: "minutes", label: "minutos" },
  { key: "seconds", label: "segundos" },
];

/**
 * Contagem regressiva até a data definida em `config/wedding.ts`.
 * Nada de data fixa no componente. Quando chega a zero, para e mostra a
 * mensagem especial configurada.
 */
export function Countdown({ tone = "light", className }: CountdownProps) {
  // Só começamos a contar depois da montagem: evita divergência entre o
  // relógio do servidor e o do visitante (erro de hidratação).
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const update = () => setParts(getCountdownParts());
    update();

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (parts?.finished) {
    return (
      <p
        className={cn(
          "font-display text-xl leading-relaxed md:text-2xl",
          tone === "light" ? "text-beige-50" : "text-green-800",
          className,
        )}
      >
        {weddingConfig.wedding.countdownFinishedMessage}
      </p>
    );
  }

  return (
    <div
      className={cn("flex items-start justify-center gap-3 sm:gap-5 md:gap-8", className)}
      role="timer"
      aria-live="off"
      aria-label="Contagem regressiva para o casamento"
    >
      {units.map(({ key, label }) => (
        <div key={key} className="flex min-w-[3.75rem] flex-col items-center sm:min-w-[4.5rem]">
          <span
            className={cn(
              "tabular font-display text-3xl font-light leading-none sm:text-4xl md:text-5xl",
              tone === "light" ? "text-beige-50" : "text-green-800",
            )}
          >
            {parts ? String(parts[key]).padStart(2, "0") : "--"}
          </span>
          <span
            className={cn(
              "mt-2 text-[0.6rem] uppercase tracking-widest sm:text-[0.65rem]",
              tone === "light" ? "text-beige-200/85" : "text-ink-muted",
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
