import type { ZodError } from "zod";

export { rsvpSchema, type RsvpSchema } from "./rsvp";
export { guestMessageSchema, type GuestMessageSchema } from "./message";

/**
 * Converte erros do Zod em `{ campo: ["mensagem"] }`.
 * Escrito manualmente para não depender de APIs deprecadas do Zod.
 */
export function toFieldErrors(error: ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    result[key] = [...(result[key] ?? []), issue.message];
  }

  return result;
}

/** Primeira mensagem de erro, para exibir num alerta único. */
export function firstErrorMessage(error: ZodError, fallback = "Verifique os campos."): string {
  return error.issues[0]?.message ?? fallback;
}
