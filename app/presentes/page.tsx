import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { Ornament } from "@/components/ui/Ornament";
import { EasterEgg } from "@/components/ui/EasterEgg";
import { ButtonLink } from "@/components/ui/Button";
import { GiftGrid } from "@/components/gifts/GiftGrid";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { getActiveGifts, giftsContent } from "@/config/gifts";
import { weddingConfig } from "@/config/wedding";
import { countGiftsWithoutLink } from "@/lib/payments/links";
import { formatCurrency, whatsappLink } from "@/lib/utils/format";
import type { Gift } from "@/types";

export const metadata: Metadata = {
  title: "Lista de presentes",
  alternates: { canonical: "/presentes" },
};

/**
 * Formas de pagamento anunciadas na página.
 * Todas ficam disponíveis dentro do link do PagBank de cada presente.
 */
const paymentMethods = [
  {
    icon: "💳",
    title: "Cartão de crédito",
    description: "Com opção de parcelamento, no ambiente seguro do PagBank.",
  },
  {
    icon: "⚡",
    title: "PIX",
    description: "Aprovação na hora, direto pelo app do seu banco.",
  },
  {
    icon: "🧾",
    title: "Boleto bancário",
    description: "Gerado na hora, para pagar no banco ou no app.",
  },
];

/**
 * Aviso visível SÓ em desenvolvimento, para o casal não publicar a lista com
 * presentes sem link do PagBank. Nunca aparece para os convidados.
 */
function MissingLinksNotice({ gifts }: { gifts: Gift[] }) {
  if (process.env.NODE_ENV === "production") return null;

  const missing = countGiftsWithoutLink(gifts);
  if (missing === 0) return null;

  return (
    <div className="container-page pt-24">
      <FormFeedback tone="info">
        <strong className="font-medium">Aviso de desenvolvimento:</strong> {missing} de{" "}
        {gifts.length} presentes ainda estão sem link do PagBank. Cole o link de cada um em{" "}
        <code className="font-mono">config/gifts.ts</code> →{" "}
        <code className="font-mono">paymentUrl</code>.
        {weddingConfig.payments.pagbankLink
          ? " Enquanto isso, eles usam o link geral."
          : " Enquanto isso, o modal oferece o PIX."}
      </FormFeedback>
    </div>
  );
}

export default function PresentesPage() {
  if (!weddingConfig.features.gifts) notFound();

  const gifts = getActiveGifts();
  const cheapest = gifts.reduce(
    (min, gift) => (gift.value < min ? gift.value : min),
    gifts[0]?.value ?? 0,
  );

  return (
    <>
      <MissingLinksNotice gifts={gifts} />

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

        <GiftGrid gifts={gifts} showFilters showCount />
      </Section>
    </>
  );
}
