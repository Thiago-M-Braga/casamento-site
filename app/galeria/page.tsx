import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ButtonLink } from "@/components/ui/Button";
import { Gallery } from "@/components/gallery/Gallery";
import { galleryImages, weddingConfig } from "@/config/wedding";

export const metadata: Metadata = {
  title: "Galeria",
  description: `Fotos de ${weddingConfig.couple.displayName} antes do grande dia.`,
  alternates: { canonical: "/galeria" },
};

export default function GaleriaPage() {
  if (!weddingConfig.features.gallery) notFound();

  return (
    <Section tone="light" className="pt-32 md:pt-40" size="lg">
      <SectionTitle
        as="h1"
        eyebrow="Momentos"
        title="Galeria"
        subtitle="Toque em qualquer foto para ver em tela cheia. Use as setas do teclado para navegar."
        className="mb-12 md:mb-16"
      />

      {galleryImages.length > 0 ? (
        <Gallery images={[...galleryImages]} />
      ) : (
        <p className="py-16 text-center text-sm text-ink-muted">
          As fotos chegam em breve. ❤️
        </p>
      )}

      <div className="mt-14 text-center">
        {/* A página /historia foi removida; a história vive na seção da home. */}
        <ButtonLink href="/#nossa-historia" variant="outline">
          Ver a nossa história
        </ButtonLink>
      </div>
    </Section>
  );
}
