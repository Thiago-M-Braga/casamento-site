"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Portal } from "./Portal";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** Rótulo acessível quando não há título visível */
  ariaLabel?: string;
  /** Largura máxima do painel. `sm` é o padrão — modais compactos. */
  size?: "sm" | "md";
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const sizes = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
} as const;

/**
 * Diálogo acessível: fecha no Esc e no clique fora, prende o foco,
 * devolve o foco ao elemento anterior e bloqueia o scroll do fundo.
 *
 * Fica sempre acima da navbar porque é renderizado no `<body>` via `Portal`.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  ariaLabel,
  size = "sm",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((item) => item.offsetParent !== null);

      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? panelRef.current)?.focus();
    }, 30);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <Portal>
      {/* z-[200] > navbar (z-50) — e, no body, sem contexto de empilhamento herdado */}
      <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-5">
        <div
          className="absolute inset-0 animate-fade-in bg-green-900/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title ? undefined : ariaLabel}
          aria-labelledby={title ? "modal-title" : undefined}
          tabIndex={-1}
          className={cn(
            "relative flex max-h-[85dvh] w-full flex-col overflow-y-auto",
            "animate-scale-in rounded-t-2xl bg-beige-50 p-5 shadow-lift",
            "sm:rounded-2xl sm:p-6",
            sizes[size],
            className,
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2 text-ink-muted transition-colors hover:bg-beige-200 hover:text-ink"
            aria-label="Fechar"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>

          {title ? (
            <h2
              id="modal-title"
              className="pr-10 font-display text-xl font-light leading-snug text-green-800"
            >
              {title}
            </h2>
          ) : null}

          {children}
        </div>
      </div>
    </Portal>
  );
}
