"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type SmartImageProps = {
  src?: string;
  alt: string;
  /** Classe do wrapper — controle aqui o aspect-ratio e o arredondamento. */
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Desativa o efeito de zoom no hover */
  noZoom?: boolean;
};

/**
 * Imagem do site.
 *
 * Usa `next/image` (otimização + lazy loading) e, se o arquivo ainda não
 * existir em `/public/images`, mostra um placeholder elegante em vez de um
 * ícone de imagem quebrada. Assim o casal pode publicar o site antes de ter
 * todas as fotos e substituí-las depois, mantendo os nomes de arquivo.
 */
export function SmartImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px",
  priority = false,
  noZoom = false,
}: SmartImageProps) {
  const [failed, setFailed] = useState(!src);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-beige-200",
        !noZoom && "group",
        className,
      )}
    >
      {failed ? (
        <Placeholder />
      ) : (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-transform duration-[900ms] ease-soft",
            !noZoom && "group-hover:scale-[1.04]",
            imageClassName,
          )}
        />
      )}
    </div>
  );
}

/** Placeholder decorativo (não é conteúdo — fica escondido de leitores de tela). */
function Placeholder() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-beige-200 via-bordo-50 to-green-100"
    >
      <div className="texture-soft absolute inset-0" />
      <svg
        viewBox="0 0 48 48"
        className="relative h-10 w-10 text-green-300/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M24 38c8-5 13-10.5 13-17a7 7 0 0 0-13-3.6A7 7 0 0 0 11 21c0 6.5 5 12 13 17Z" />
      </svg>
    </div>
  );
}
