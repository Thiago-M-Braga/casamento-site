"use client";

import { useEffect, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils/cn";

type HeroImage = { src: string; alt: string };

/**
 * Fundo do hero: uma ou mais fotos com transição suave (cross-fade) e um leve
 * zoom. Com uma única imagem configurada, não há transição alguma.
 */
export function HeroBackground({ images }: { images: readonly HeroImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      7000,
    );

    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 -z-10" aria-hidden={images.length > 1 ? undefined : "true"}>
      {images.map((image, position) => (
        <div
          key={image.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-soft",
            position === index ? "opacity-100" : "opacity-0",
          )}
        >
          <SmartImage
            src={image.src}
            alt={position === 0 ? image.alt : ""}
            priority={position === 0}
            noZoom
            sizes="100vw"
            className="h-full w-full"
            imageClassName="animate-slow-zoom"
          />
        </div>
      ))}

      {/* Véu escuro para garantir contraste do texto (acessibilidade) */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/60 via-green-900/45 to-green-900/75" />
    </div>
  );
}
