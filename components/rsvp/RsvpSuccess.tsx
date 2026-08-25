import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { rsvpContent, weddingConfig } from "@/config/wedding";
import { firstName, interpolate } from "@/lib/utils/format";

type RsvpSuccessProps = {
  name: string;
  attending: boolean;
};

/** Tela de agradecimento exibida no lugar do formulário depois do envio. */
export function RsvpSuccess({ name, attending }: RsvpSuccessProps) {
  const content = attending ? rsvpContent.successAttending : rsvpContent.successNotAttending;
  const title = interpolate(content.title, { nome: firstName(name) });

  return (
    <div
      className="flex animate-fade-up flex-col items-center gap-5 py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <Ornament />

      <h2 className="text-3xl md:text-4xl">{title}</h2>

      <div className="max-w-md space-y-2 text-base leading-relaxed text-ink-soft">
        {content.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {attending ? (
          <ButtonLink href="/casamento" variant="outline" size="sm">
            Ver local e horário
          </ButtonLink>
        ) : null}

        {weddingConfig.features.gifts ? (
          <ButtonLink href="/presentes" variant="primary" size="sm">
            Ver lista de presentes
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
