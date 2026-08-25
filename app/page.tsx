import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { Ornament } from "@/components/ui/Ornament";
import { EasterEgg } from "@/components/ui/EasterEgg";

import { Hero } from "@/components/sections/Hero";
import { WeddingDetails } from "@/components/sections/WeddingDetails";
import { UsefulInfo } from "@/components/sections/UsefulInfo";
import { Gallery } from "@/components/gallery/Gallery";
import { GiftGrid } from "@/components/gifts/GiftGrid";

import { galleryImages, storyContent, usefulInfo, weddingConfig } from "@/config/wedding";
import { getActiveGifts, getFeaturedGifts, giftsContent } from "@/config/gifts";
import { formatTime, formatWeddingDateLong, formatWeddingWeekday } from "@/lib/utils/date";

export default function HomePage() {
  const { couple, ceremony, features, payments } = weddingConfig;
  const featuredGifts = getFeaturedGifts(3);
  const totalGifts = getActiveGifts().length;

  return (
    <>
      <Hero />

      {/* ------------------------------------------------------------------ */}
      {/* Convite curto + prévia da história                                  */}
      {/* ------------------------------------------------------------------ */}
      <Section id="nossa-historia" tone="light" size="lg">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <SectionTitle
              eyebrow="Nossa história"
              title={storyContent.title}
              align="left"
              subtitle={storyContent.subtitle}
            />

            <div className="mt-7 space-y-4 text-base leading-relaxed text-ink-soft">
              {storyContent.paragraphs.slice(0, 2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="grid grid-cols-2 gap-4">
            <SmartImage
              src={storyContent.images[0]?.src}
              alt={storyContent.images[0]?.alt ?? `${couple.displayName}`}
              className="aspect-[3/4] rounded-lg shadow-card"
              sizes="(max-width: 1024px) 45vw, 300px"
            />
            <SmartImage
              src={storyContent.images[1]?.src}
              alt={storyContent.images[1]?.alt ?? `${couple.displayName}`}
              className="mt-8 aspect-[3/4] rounded-lg shadow-card"
              sizes="(max-width: 1024px) 45vw, 300px"
            />
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Faixa com a data                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Section tone="green" className="text-center">
        <Reveal className="flex flex-col items-center gap-6">
          <Ornament className="text-bordo-300" />
          <p className="font-script text-3xl text-beige-100 md:text-4xl">
            {couple.tagline}
          </p>
          <p className="text-sm uppercase tracking-widest text-beige-200/80 md:text-base">
            {formatWeddingWeekday()}, {formatWeddingDateLong()} · {formatTime(ceremony.time)}
          </p>
          <p className="text-sm text-beige-200/70">
            {ceremony.city} — {ceremony.state}
          </p>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* O casamento                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Section id="o-casamento" tone="beige" size="lg">
        <SectionTitle
          eyebrow="O grande dia"
          title="O casamento"
          subtitle="Cerimônia e festa no mesmo lugar. Guarde os detalhes no celular antes de sair de casa."
          className="mb-12 md:mb-16"
        />

        <WeddingDetails />

        <div className="mt-12 text-center">
          <ButtonLink href="/casamento" variant="ghost">
            Ver todos os detalhes
          </ButtonLink>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Presentes (prévia)                                                  */}
      {/* ------------------------------------------------------------------ */}
      {features.gifts && featuredGifts.length > 0 ? (
        <Section id="presentes" tone="light" size="lg">
          <SectionTitle
            eyebrow={giftsContent.eyebrow}
            title={giftsContent.title}
            subtitle={giftsContent.note}
            className="mb-12 md:mb-16"
          />

          <GiftGrid gifts={featuredGifts} showFilters={false} />

          <div className="mt-12 flex flex-col items-center gap-3">
            <ButtonLink href="/presentes" variant="primary" size="lg">
              Ver a lista completa
            </ButtonLink>
            <p className="text-xs uppercase tracking-widest text-ink-muted">
              {totalGifts} presentes · cartão, PIX ou boleto
            </p>
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Informações úteis                                                   */}
      {/* ------------------------------------------------------------------ */}
      {features.usefulInfo ? (
        <Section id="informacoes" tone="beige" size="lg">
          <SectionTitle
            eyebrow="Antes de vir"
            title={usefulInfo.title}
            subtitle={usefulInfo.subtitle}
            className="mb-12"
          />

          <UsefulInfo />

          <EasterEgg className="mt-14" />
        </Section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* RSVP (chamada)                                                      */}
      {/* ------------------------------------------------------------------ */}
      {features.rsvp ? (
        <Section tone="bordo" className="text-center">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6">
            <span className="eyebrow">Confirmação de presença</span>
            <h2 className="text-3xl md:text-4xl">Você vem, né?</h2>
            <p className="text-base leading-relaxed text-ink-soft">
              A gente precisa saber quem vem para acertar os lugares e o buffet. Leva menos de dois
              minutos.
            </p>
            <ButtonLink href="/rsvp" variant="primary" size="lg">
              Confirmar presença
            </ButtonLink>
          </Reveal>
        </Section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Galeria (prévia)                                                    */}
      {/* ------------------------------------------------------------------ */}
      {features.gallery && galleryImages.length > 0 ? (
        <Section id="galeria" tone="beige" size="lg">
          <SectionTitle
            eyebrow="Momentos"
            title="Galeria"
            subtitle="Um pouco do que já viveram com a gente até aqui."
            className="mb-12 md:mb-16"
          />

          <Gallery images={[...galleryImages]} limit={7} />

          <div className="mt-12 text-center">
            <ButtonLink href="/galeria" variant="outline">
              Ver todas as fotos
            </ButtonLink>
          </div>
        </Section>
      ) : null}
    </>
  );
}
