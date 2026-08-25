import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { RsvpForm } from "@/components/rsvp/RsvpForm";
import { rsvpContent, weddingConfig } from "@/config/wedding";
import { formatWeddingDateLong } from "@/lib/utils/date";
import { formatWhatsapp, whatsappLink } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Confirmar presença",
  description: rsvpContent.subtitle,
  alternates: { canonical: "/rsvp" },
  robots: { index: true, follow: true },
};

export default function RsvpPage() {
  if (!weddingConfig.features.rsvp) notFound();

  const { contact } = weddingConfig;

  return (
    <Section tone="light" className="pt-32 md:pt-40" size="lg">
      <div className="mx-auto max-w-container-narrow">
        <SectionTitle
          as="h1"
          eyebrow={formatWeddingDateLong()}
          title={rsvpContent.title}
          subtitle={rsvpContent.subtitle}
        />

        <div className="mt-12 rounded-xl border border-green-100 bg-beige-50 p-6 shadow-soft md:p-9">
          <RsvpForm />
        </div>

        {contact.whatsapp ? (
          <p className="mt-8 text-center text-sm text-ink-soft">
            Deu algum problema no formulário?{" "}
            <a
              href={whatsappLink(
                contact.whatsapp,
                "Oi! Quero confirmar minha presença no casamento.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-medium text-green-800"
            >
              Fale com a gente no WhatsApp {formatWhatsapp(contact.whatsapp)}
            </a>
          </p>
        ) : null}
      </div>
    </Section>
  );
}
