import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { Countdown } from "@/components/sections/Countdown";
import { WeddingDetails, VenueMap } from "@/components/sections/WeddingDetails";
import { UsefulInfo } from "@/components/sections/UsefulInfo";
import { usefulInfo, weddingConfig } from "@/config/wedding";
import {
  formatTime,
  formatWeddingDateLong,
  formatWeddingWeekday,
  weddingIsoString,
} from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "O casamento",
  description: `Data, horário e endereço do casamento de ${weddingConfig.couple.displayName}.`,
  alternates: { canonical: "/casamento" },
};

export default function CasamentoPage() {
  const { ceremony, features } = weddingConfig;

  return (
    <>
      <Section tone="light" className="pt-32 md:pt-40">
        <SectionTitle
          as="h1"
          eyebrow="O grande dia"
          title="O casamento"
          subtitle="Tudo o que você precisa saber para chegar no lugar certo, na hora certa."
        />

        <Reveal className="mt-12 flex flex-col items-center gap-4 text-center">
          <time
            dateTime={weddingIsoString()}
            className="font-display text-3xl font-light text-green-800 md:text-4xl"
          >
            {formatWeddingDateLong()}
          </time>
          <p className="text-sm uppercase tracking-widest text-ink-muted">
            {formatWeddingWeekday()} · {formatTime(ceremony.time)}
          </p>

          <Countdown tone="dark" className="mt-6" />
        </Reveal>
      </Section>

      <Section tone="beige" size="lg">
        <WeddingDetails />

        {ceremony.mapsEmbedUrl ? (
          <div className="mt-12 grid gap-6 md:grid-cols-1">
            <VenueMap embedUrl={ceremony.mapsEmbedUrl} title={`Mapa — ${ceremony.name}`} />
          </div>
        ) : null}
      </Section>

      {features.usefulInfo ? (
        <Section tone="light" size="lg">
          <SectionTitle
            eyebrow="Antes de vir"
            title={usefulInfo.title}
            subtitle={usefulInfo.subtitle}
            className="mb-12"
          />
          <UsefulInfo />
        </Section>
      ) : null}

      {features.rsvp ? (
        <Section tone="bordo" className="text-center">
          <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-6">
            <Ornament />
            <h2 className="text-3xl md:text-4xl">Contamos com você</h2>
            <p className="text-base leading-relaxed text-ink-soft">
              Confirme sua presença para a gente reservar seu lugar (e sua fatia de bolo).
            </p>
            <ButtonLink href="/rsvp" variant="primary" size="lg">
              Confirmar presença
            </ButtonLink>
          </Reveal>
        </Section>
      ) : null}
    </>
  );
}
