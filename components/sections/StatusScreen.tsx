import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Ornament } from "@/components/ui/Ornament";
import { ButtonLink } from "@/components/ui/Button";
import { weddingConfig } from "@/config/wedding";
import { whatsappLink } from "@/lib/utils/format";

type Action = { label: string; href: string; variant?: "primary" | "outline" | "ghost" };

type StatusScreenProps = {
  emoji: string;
  title: string;
  lines: string[];
  detail?: ReactNode;
  actions?: Action[];
  /** Mostra o atalho de WhatsApp para falar com o casal */
  showSupport?: boolean;
};

/** Tela de retorno (agradecimento, pagamento pendente, pagamento recusado). */
export function StatusScreen({
  emoji,
  title,
  lines,
  detail,
  actions = [],
  showSupport = false,
}: StatusScreenProps) {
  const { contact } = weddingConfig;

  return (
    <Section tone="light" className="pt-32 md:pt-40" size="lg">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <span aria-hidden="true" className="text-4xl">
          {emoji}
        </span>

        <h1 className="text-3xl md:text-4xl">{title}</h1>

        <Ornament />

        <div className="space-y-3 text-base leading-relaxed text-ink-soft">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        {detail ? (
          <div className="w-full rounded-lg border border-green-100 bg-beige-100 px-5 py-4 text-left text-sm text-ink-soft">
            {detail}
          </div>
        ) : null}

        {actions.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => (
              <ButtonLink
                key={action.href}
                href={action.href}
                variant={action.variant ?? "outline"}
              >
                {action.label}
              </ButtonLink>
            ))}
          </div>
        ) : null}

        {showSupport && contact.whatsapp ? (
          <p className="mt-2 text-sm text-ink-muted">
            Precisa de ajuda?{" "}
            <a
              href={whatsappLink(contact.whatsapp, "Oi! Tive um problema no pagamento do presente.")}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-medium text-green-800"
            >
              Fale com a gente no WhatsApp
            </a>
          </p>
        ) : null}
      </div>
    </Section>
  );
}
