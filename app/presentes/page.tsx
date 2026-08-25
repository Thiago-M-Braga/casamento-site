import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { Ornament } from "@/components/ui/Ornament";
import { EasterEgg } from "@/components/ui/EasterEgg";
import { ButtonLink } from "@/components/ui/Button";
import { GiftGrid } from "@/components/gifts/GiftGrid";
import { ContributionSection } from "@/components/gifts/ContributionSection";
import { getActiveGifts, giftsContent } from "@/config/gifts";
import { weddingConfig } from "@/config/wedding";
import { formatCurrency, whatsappLink } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Lista de presentes",
  description: giftsContent.note,
  alternates: { canonical: "/presentes" },
};

/** Formas de pagamento anunciadas na página (todas passam pelo mesmo modal). */
const paymentMethods = [
  {
    icon: "💳",
    title: "Cartão de crédito",
    description: "No ambiente seguro do Mercado Pago, com opção de parcelamento.",
  },
  {
    icon: "🧾",
    title: "Boleto bancário",
    description: "Gerado na hora, para pagar no banco ou no app.",
  },
  {
    icon: "⚡",
    title: "PIX",
    description: "Chave, QR Code e código copia e cola direto aqui no site.",
  },
];

export default function PresentesPage() {
  if (!weddingConfig.features.gifts) notFound();

  const gifts = getActiveGifts();
  const cheapest = gifts.reduce(
    (min, gift) => (gift.value < min ? gift.value : min),
    gifts[0]?.value ?? 0,
  );

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Abertura                                                           */}
      {/* ------------------------------------------------------------------ */}
      <Section tone="light" className="pt-32 md:pt-40">
        <SectionTitle
          as="h1"
          eyebrow={giftsContent.eyebrow}
          title={giftsContent.title}
          subtitle={giftsContent.intro[0]}
        />

        <Reveal className="mx-auto mt-8 max-w-container-narrow text-center">
          {giftsContent.intro.slice(1).map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed text-ink-soft">
              {paragraph}
            </p>
          ))}
          <p className="mt-2 font-script text-2xl text-bordo-500">{giftsContent.disclaimer}</p>

          <p className="mt-8 text-sm text-ink-muted">
            {gifts.length} presentes na lista, a partir de {formatCurrency(cheapest)}.
          </p>
        </Reveal>

        {/* Formas de pagamento */}
        <Reveal delay={120} className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {paymentMethods.map((method) => (
            <div key={method.title} className="surface p-5 text-center">
              <span aria-hidden="true" className="text-2xl">
                {method.icon}
              </span>
              <h2 className="mt-3 font-display text-lg text-green-800">{method.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{method.description}</p>
            </div>
          ))}
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Lista completa                                                     */}
      {/* ------------------------------------------------------------------ */}
      <Section id="lista-completa" tone="beige" size="lg" aria-labelledby="titulo-lista">
        <SectionTitle
          id="titulo-lista"
          eyebrow="Escolha o seu"
          title="A lista completa"
          subtitle="Filtre por faixa de valor e clique em Presentear para escolher como pagar."
          className="mb-12"
        />

        <GiftGrid
          gifts={gifts}
          mercadoPagoEnabled={weddingConfig.payments.mercadoPagoEnabled}
          showFilters
          showCount
        />
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Contribuição de valor livre                                        */}
      {/* ------------------------------------------------------------------ */}
      <ContributionSection />

      {/* ------------------------------------------------------------------ */}
      {/* Fechamento                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Section tone="light" className="text-center">
        <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <Ornament />
          <p className="text-base leading-relaxed text-ink-soft">
            De verdade: a sua presença já é o presente. O resto é bônus.
          </p>

          {weddingConfig.contact.whatsapp ? (
            <ButtonLink
              href={whatsappLink(
                weddingConfig.contact.whatsapp,
                "Oi! Tenho uma dúvida sobre a lista de presentes.",
              )}
              external
              variant="outline"
              size="sm"
            >
              Falar com o casal
            </ButtonLink>
          ) : null}

          <EasterEgg className="mt-4" />
        </Reveal>
      </Section>
    </>
  );
}
