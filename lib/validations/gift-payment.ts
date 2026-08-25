import { z } from "zod";

/** Tamanho máximo do comprovante aceito (5 MB). */
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
] as const;

export const giftPaymentSchema = z
  .object({
    /** Vazio = contribuição de valor livre, sem presente da lista */
    giftId: z.string().trim().max(80).optional().default(""),

    payerName: z.string().trim().max(120, "Nome muito longo.").optional().default(""),

    anonymous: z.boolean(),

    method: z.enum(["link", "pix", "outro"]),

    message: z.string().trim().max(600, "Recado muito longo.").optional().default(""),

    /** Honeypot */
    website: z.string().max(0).optional().default(""),
  })
  .refine((data) => data.anonymous || data.payerName.trim().length >= 2, {
    message: "Informe seu nome ou marque a opção Anônimo.",
    path: ["payerName"],
  });

export type GiftPaymentSchema = z.infer<typeof giftPaymentSchema>;
