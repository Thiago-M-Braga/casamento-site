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
 * Converte uma data/hora "de parede" no fuso do casamento para o instante
 * correto (timestamp em ms, UTC), independente do fuso de quem acessa o site.
 *
 * `month` é 1–12 (e não 0–11 como no `Date`). `hour` aceita 24 para dizer
 * "fim do dia": a virada para o dia seguinte é resolvida automaticamente.
 */
export function instantFromZonedTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  timeZone: string = weddingConfig.wedding.timezone,
): number {
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0);

  // Duas passagens resolvem corretamente as bordas de horário de verão.
  let instant = naiveUtc - timeZoneOffsetMs(naiveUtc, timeZone);
  instant = naiveUtc - timeZoneOffsetMs(instant, timeZone);

  return instant;
}

/** Partes da data do casamento (`month` de 1 a 12), lidas da configuração. */
export function getWeddingDateParts(): { year: number; month: number; day: number } {
  const [year, month, day] = weddingConfig.wedding.date.split("-").map(Number);
  return { year: year ?? 1970, month: month ?? 1, day: day ?? 1 };
}

/**
 * Converte "2027-08-21" + "16:00" + "America/Sao_Paulo" no instante correto
 * (timestamp em ms, UTC), independente do fuso de quem acessa o site.
 */
export function getWeddingTimestamp(): number {
  const { year, month, day } = getWeddingDateParts();
  const [hour, minute] = weddingConfig.wedding.time.split(":").map(Number);

  return instantFromZonedTime(year, month, day, hour ?? 0, minute ?? 0);
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

/**
 * Formata um instante qualquer no fuso do casamento — assim o texto é o mesmo
 * para quem acessa de São Paulo, de Lisboa ou do celular com fuso errado.
 *
 * `formatInstant(abertura, { day: "numeric", month: "long" })` → "21 de agosto"
 */
export function formatInstant(
  instant: number,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" },
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: weddingConfig.wedding.timezone,
    ...options,
  }).format(new Date(instant));
}

/** "00h" ou "06h30" — hora de um instante, no fuso do casamento. */
export function formatInstantHour(instant: number): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: weddingConfig.wedding.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(instant))
    .split(":");

  const [hour, minute] = parts;
  return !minute || minute === "00" ? `${hour}h` : `${hour}h${minute}`;
}
