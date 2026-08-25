import { weddingConfig } from "@/config/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { LocationCard } from "./LocationCard";

/**
 * Local do casamento.
 *
 * Hoje a cerimônia e a festa acontecem no mesmo endereço, então mostramos um
 * card só, centralizado. Se um dia voltarem a ser dois lugares, acrescente o
 * segundo `LocationCard` aqui e troque `max-w-2xl` por `md:grid-cols-2`.
 */
export function WeddingDetails() {
  const { ceremony } = weddingConfig;

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <Reveal>
        <LocationCard label="Cerimônia e festa" venue={ceremony} />
      </Reveal>
    </div>
  );
}

/** Mapa por iframe — só aparece se `mapsEmbedUrl` estiver configurado. */
export function VenueMap({
  embedUrl,
  title,
}: {
  embedUrl?: string;
  title: string;
}) {
  if (!embedUrl) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-green-100 shadow-soft">
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[320px] w-full border-0 md:h-[420px]"
        allowFullScreen
      />
    </div>
  );
}
