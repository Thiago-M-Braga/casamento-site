import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";
import type { TimelineEvent } from "@/types";

/**
 * Linha do tempo do casal.
 * Os eventos vêm de `config/wedding.ts` → `timeline`.
 * Mobile: coluna única com a linha à esquerda.
 * Desktop: eventos alternando dos dois lados da linha central.
 */
export function StoryTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <ol className="relative mx-auto max-w-4xl">
      {/* Linha vertical */}
      <span
        aria-hidden="true"
        className="absolute left-[0.4375rem] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-bordo-300 via-green-200 to-transparent md:left-1/2 md:-translate-x-1/2"
      />

      {events.map((event, index) => {
        const alignRight = index % 2 === 1;

        return (
          <Reveal
            as="li"
            key={`${event.year}-${event.title}`}
            delay={index * 60}
            className="relative pb-12 pl-9 last:pb-0 md:pl-0"
          >
            {/* Marcador */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-bordo-400 bg-beige-100 md:left-1/2 md:-translate-x-1/2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-bordo-400" />
            </span>

            <div
              className={cn(
                "md:grid md:grid-cols-2 md:items-center md:gap-12",
                alignRight && "md:[&>*:first-child]:order-2",
              )}
            >
              <div className={cn("md:py-4", alignRight ? "md:pl-12" : "md:pr-12 md:text-right")}>
                <span className="eyebrow">{event.year}</span>
                <h3 className="mt-2 text-2xl md:text-[1.75rem]">{event.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
                  {event.description}
                </p>
              </div>

              <div className={cn("mt-5 md:mt-0", alignRight ? "md:pr-12" : "md:pl-12")}>
                <SmartImage
                  src={event.image}
                  alt={`${event.year} — ${event.title}`}
                  className="aspect-[4/3] rounded-lg shadow-card"
                  sizes="(max-width: 768px) 90vw, 420px"
                />
              </div>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
