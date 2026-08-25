import { ButtonLink } from "@/components/ui/Button";
import { heroImages, weddingConfig } from "@/config/wedding";
import { formatWeddingDateLong, formatWeddingWeekday, weddingIsoString } from "@/lib/utils/date";
import { Countdown } from "./Countdown";
import { HeroBackground } from "./HeroBackground";

export function Hero() {
  const { couple, ceremony, features } = weddingConfig;

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-20 pt-navbar text-center"
      aria-labelledby="hero-title"
    >
      <HeroBackground images={heroImages} />

      <p className="animate-fade-in text-[0.65rem] uppercase tracking-widest text-beige-200/90 md:text-xs">
        {formatWeddingWeekday()} · {ceremony.city} — {ceremony.state}
      </p>

      <h1
        id="hero-title"
        className="mt-6 animate-fade-up font-display text-[2.6rem] font-light leading-[1.05] tracking-title text-beige-50 xs:text-5xl md:text-6xl lg:text-7xl"
      >
        {couple.displayName}
      </h1>

      <p className="mt-5 max-w-md animate-fade-up font-script text-2xl text-beige-100/95 md:max-w-xl md:text-3xl">
        {couple.tagline}
      </p>

      <div className="mt-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px w-10 bg-beige-200/50" />
        <span className="h-1.5 w-1.5 rotate-45 bg-bordo-300" />
        <span className="h-px w-10 bg-beige-200/50" />
      </div>

      <time
        dateTime={weddingIsoString()}
        className="mt-7 animate-fade-up text-sm uppercase tracking-widest text-beige-100 md:text-base"
      >
        {formatWeddingDateLong()}
      </time>

      <Countdown className="mt-10" tone="light" />

      <div className="mt-11 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
        {features.rsvp ? (
          <ButtonLink href="/rsvp" variant="bordo" size="lg" fullWidth className="sm:w-auto">
            Confirmar presença
          </ButtonLink>
        ) : null}

        {features.gifts ? (
          <ButtonLink
            href="/presentes"
            variant="outline"
            size="lg"
            fullWidth
            className="border-beige-100/60 text-beige-50 hover:border-beige-50 hover:bg-beige-50 hover:text-green-900 sm:w-auto"
          >
            Lista de presentes
          </ButtonLink>
        ) : null}
      </div>

      <a
        href="#nossa-historia"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-3 text-beige-100/80 transition-colors hover:text-beige-50"
        aria-label="Rolar para a próxima seção"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 animate-float"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
