"use client";

import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils/cn";
import { Lightbox, type LightboxImage } from "./Lightbox";

type GalleryProps = {
  images: LightboxImage[];
  /** Limita a quantidade exibida (usado na prévia da home) */
  limit?: number;
  className?: string;
};

/**
 * Grid responsivo com lightbox.
 * As fotos vêm de `config/wedding.ts` → `galleryImages`, apontando para
 * `/public/images/galeria`. Basta trocar os arquivos mantendo os nomes.
 */
export function Gallery({ images, limit, className }: GalleryProps) {
  const visible = typeof limit === "number" ? images.slice(0, limit) : images;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (visible.length === 0) return null;

  return (
    <>
      <ul
        className={cn(
          "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4",
          className,
        )}
      >
        {visible.map((image, index) => (
          <li
            key={image.src}
            // A partir do tablet, cada 6ª foto ocupa dois espaços e quebra a
            // monotonia do grid. No celular todas ficam do mesmo tamanho.
            className={cn(index % 6 === 0 && "md:col-span-2 md:row-span-2")}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block h-full w-full overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-bordo-400"
              aria-label={`Abrir foto ${index + 1}: ${image.alt}`}
            >
              <SmartImage
                src={image.src}
                alt={image.alt}
                className="aspect-square h-full w-full rounded-md"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
              />
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null ? (
        <Lightbox
          images={visible}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      ) : null}
    </>
  );
}
