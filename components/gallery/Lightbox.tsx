"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Portal } from "@/components/ui/Portal";

export type LightboxImage = { src: string; alt: string };

type LightboxProps = {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

/**
 * Visualizador em tela cheia.
 * Teclado: ← → navega, Esc fecha. Fecha também no clique no fundo.
 */
export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const total = images.length;
  const current = images[index];
  const [failed, setFailed] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      setFailed(false);
      onNavigate((next + total) % total);
    },
    [onNavigate, total],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    };

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [goTo, index, onClose]);

  if (!current) return null;

  return (
    <Portal>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${total}: ${current.alt}`}
      className="fixed inset-0 z-[200] flex animate-fade-in items-center justify-center bg-green-900/95 p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar galeria"
        className="absolute inset-0 h-full w-full cursor-zoom-out"
        tabIndex={-1}
      />

      <figure className="relative z-10 flex max-h-full w-full max-w-5xl flex-col items-center gap-4">
        <div className="relative flex h-[68dvh] w-full items-center justify-center">
          {failed ? (
            <p className="text-sm text-beige-200">
              Esta foto ainda não foi publicada. Volte em breve. ❤️
            </p>
          ) : (
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              onError={() => setFailed(true)}
              className="animate-scale-in object-contain"
              priority
            />
          )}
        </div>

        <figcaption className="text-center text-xs text-beige-200/80">
          <span className="tabular">
            {index + 1} / {total}
          </span>
          <span className="mx-2 opacity-40">·</span>
          {current.alt}
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Foto anterior"
        className="absolute left-2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-beige-50/10 text-beige-50 backdrop-blur transition-colors hover:bg-beige-50/25 sm:left-6"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Próxima foto"
        className="absolute right-2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-beige-50/10 text-beige-50 backdrop-blur transition-colors hover:bg-beige-50/25 sm:right-6"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar galeria"
        className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-beige-50/10 text-beige-50 backdrop-blur transition-colors hover:bg-beige-50/25 sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
        </svg>
      </button>
    </div>
    </Portal>
  );
}
