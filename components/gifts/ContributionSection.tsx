"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { weddingConfig } from "@/config/wedding";
import { PaymentModal } from "./PaymentModal";

/**
 * Bloco "prefiro escolher o valor": contribuição livre, sem card de presente.
 * Abre o mesmo modal de pagamento (cartão, boleto ou PIX).
 *
 * Não aparece se nenhuma forma de pagamento estiver configurada.
 */
export function ContributionSection() {
  const [open, setOpen] = useState(false);
  const { pixKey, mercadoPagoLink, mercadoPagoEnabled } = weddingConfig.payments;

  if (!pixKey && !mercadoPagoLink && !mercadoPagoEnabled) return null;

  return (
    <Section tone="green">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <SectionTitle
          eyebrow="Ou do jeito mais simples"
          title={<span className="text-beige-50">Prefiro escolher o valor</span>}
          subtitle={
            <span className="text-beige-200/85">
              Sem card, sem categoria, sem valor sugerido. Você decide quanto e como pagar — cartão,
              boleto ou PIX. A gente promete usar com (alguma) responsabilidade.
            </span>
          }
        />

        <Button variant="bordo" size="lg" onClick={() => setOpen(true)}>
          Fazer uma contribuição
        </Button>
      </Reveal>

      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        gift={null}
        mercadoPagoEnabled={mercadoPagoEnabled}
      />
    </Section>
  );
}
