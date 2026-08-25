import { weddingConfig } from "@/config/wedding";

/**
 * Utilidades de data. A data/hora do casamento vem SEMPRE de
 * `config/wedding.ts` — nunca deve ser escrita dentro de um componente.
 */

/** Diferença, em ms, entre o fuso informado e o UTC para um instante dado. */
function timeZoneOffsetMs(instant: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(new Date(instant));
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  // `hour` pode vir como 24 em alguns runtimes quando é meia-noite.
  const hour = get("hour") % 24;

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second"),
  );

  return asUtc - instant;
}

/**
 * Converte "2027-08-21" + "16:00" + "America/Sao_Paulo" no instante correto
 * (timestamp em ms, UTC), independente do fuso de quem acessa o site.
 */
export function getWeddingTimestamp(): number {
  const { date, time, timezone } = weddingConfig.wedding;

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const naiveUtc = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0);

  // Duas passagens resolvem corretamente as bordas de horário de verão.
  let instant = naiveUtc - timeZoneOffsetMs(naiveUtc, timezone);
  instant = naiveUtc - timeZoneOffsetMs(instant, timezone);

  return instant;
}

export function getWeddingDate(): Date {
  return new Date(getWeddingTimestamp());
}

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** true quando a data já chegou/passou */
  finished: boolean;
};

export function getCountdownParts(now: number = Date.now()): CountdownParts {
  const diff = getWeddingTimestamp() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }

  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: false,
  };
}

/** "21 de agosto de 2027" */
export function formatWeddingDateLong(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: weddingConfig.wedding.timezone,
  }).format(getWeddingDate());
}

/** "21.08.2027" — usado em detalhes visuais */
export function formatWeddingDateShort(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: weddingConfig.wedding.timezone,
  })
    .format(getWeddingDate())
    .replace(/\//g, ".");
}

/** "sábado" */
export function formatWeddingWeekday(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    timeZone: weddingConfig.wedding.timezone,
  }).format(getWeddingDate());
}

/** "16h" ou "16h30" */
export function formatTime(time: string): string {
  const [hour, minute] = time.split(":");
  if (!minute || minute === "00") return `${hour}h`;
  return `${hour}h${minute}`;
}

/** Data ISO completa, para o atributo `dateTime` do HTML semântico. */
export function weddingIsoString(): string {
  return getWeddingDate().toISOString();
}
