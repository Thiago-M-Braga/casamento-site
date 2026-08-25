import { ButtonLink } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatTime } from "@/lib/utils/date";
import type { WeddingVenue } from "@/types";

type LocationCardProps = {
  /** Rótulo acima do nome do local. Ex.: "Cerimônia e festa" */
  label: string;
  venue: WeddingVenue;
};

export function LocationCard({ label, venue }: LocationCardProps) {
  return (
    <article className="surface flex h-full flex-col overflow-hidden">
      <SmartImage
        src={venue.image}
        alt={`${label}: ${venue.name}`}
        className="aspect-[16/10] w-full"
        sizes="(max-width: 768px) 100vw, 520px"
      />

      <div className="flex flex-1 flex-col p-6 md:p-8">
        <span className="eyebrow">{label}</span>

        <h3 className="mt-3 text-2xl md:text-[1.75rem]">{venue.name}</h3>

        <dl className="mt-5 space-y-3 text-sm text-ink-soft">
          <div className="flex gap-3">
            <dt className="sr-only">Horário</dt>
            <span aria-hidden="true" className="text-bordo-500">
              ◷
            </span>
            <dd>{formatTime(venue.time)}</dd>
          </div>

          <div className="flex gap-3">
            <dt className="sr-only">Endereço</dt>
            <span aria-hidden="true" className="text-bordo-500">
              ⌖
            </span>
            <dd>
              {venue.address}
              <br />
              {venue.city} — {venue.state}
            </dd>
          </div>
        </dl>

        {venue.description ? (
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">{venue.description}</p>
        ) : null}

        {venue.mapsUrl ? (
          <div className="mt-7 pt-1">
            <ButtonLink
              href={venue.mapsUrl}
              external
              variant="outline"
              size="sm"
              aria-label={`Como chegar em ${venue.name} (abre o Google Maps em nova aba)`}
            >
              Como chegar
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </article>
  );
}
