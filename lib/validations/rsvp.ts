import { z } from "zod";

/**
 * Schema compartilhado entre client e server.
 * A validação do servidor é a que vale — a do cliente é só conveniência.
 */
export const rsvpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Informe seu nome completo.")
      .max(120, "Nome muito longo."),

    attending: z.boolean(),

    adults: z.coerce
      .number()
      .int("Informe um número inteiro.")
      .min(0, "Valor inválido.")
      .max(20, "Para grupos maiores, fale com a gente pelo WhatsApp."),

    children: z.coerce
      .number()
      .int("Informe um número inteiro.")
      .min(0, "Valor inválido.")
      .max(20, "Para grupos maiores, fale com a gente pelo WhatsApp."),

    companions: z.string().trim().max(500, "Texto muito longo.").optional().or(z.literal("")),

    childrenNames: z.string().trim().max(500, "Texto muito longo.").optional().or(z.literal("")),

    email: z
      .string()
      .trim()
      .max(160, "E-mail muito longo.")
      .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), {
        message: "E-mail inválido.",
      })
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .trim()
      .max(25, "Telefone muito longo.")
      .refine((value) => value === "" || value.replace(/\D/g, "").length >= 10, {
        message: "Telefone incompleto (com DDD).",
      })
      .optional()
      .or(z.literal("")),

    notes: z.string().trim().max(1000, "Texto muito longo.").optional().or(z.literal("")),

    /** Honeypot — se vier preenchido, é bot. */
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .refine((data) => !data.attending || data.adults >= 1, {
    message: "Informe pelo menos 1 adulto (você).",
    path: ["adults"],
  });

export type RsvpSchema = z.infer<typeof rsvpSchema>;
