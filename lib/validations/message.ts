import { z } from "zod";

export const guestMessageSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(80, "Nome muito longo."),

  message: z
    .string()
    .trim()
    .min(5, "Escreva uma mensagem um pouquinho maior. 🙂")
    .max(600, "Mensagem muito longa (máx. 600 caracteres)."),

  /** Honeypot */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type GuestMessageSchema = z.infer<typeof guestMessageSchema>;
