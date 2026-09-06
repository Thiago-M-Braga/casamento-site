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
            key={image.src + index}
            // A partir do tablet, cada 6ª foto ocupa dois espaços e quebra a
            // monotonia do grid. No celular todas ficam do mesmo tamanho.
            className={cn(index % 6 === 0 && "md:col-span-2 md:row-span-2")}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative block h-full w-full overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-bordo-400"
              aria-label={
                image.credit
                  ? `Abrir foto ${index + 1}, enviada por ${image.credit}: ${image.alt}`
                  : `Abrir foto ${index + 1}: ${image.alt}`
              }
            >
              <SmartImage
                src={image.src}
                alt={image.alt}
                className="aspect-square h-full w-full rounded-md"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
              />

              {/* Crédito das fotos enviadas por convidados. Fica sempre visível
                  (e não só no hover) porque no celular não existe hover — e é
                  justamente ele que conta de quem é o olhar da foto. */}
              {image.credit ? (
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end rounded-b-md bg-gradient-to-t from-green-900/75 via-green-900/25 to-transparent px-2.5 pb-2 pt-8"
                  aria-hidden="true"
                >
                  <span className="truncate text-[0.6rem] uppercase tracking-widest text-beige-50/90 md:text-[0.65rem]">
                    {image.credit}
                  </span>
                </span>
              ) : null}
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
