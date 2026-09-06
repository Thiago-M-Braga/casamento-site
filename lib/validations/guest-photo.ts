import { z } from "zod";

/**
 * Limites do envio de fotos pelos convidados.
 *
 * O convidado envia UMA foto por requisição (o componente faz a fila). Isso é
 * de propósito: funções serverless têm limite de tamanho de corpo (~4,5 MB na
 * Vercel), então mandar dez fotos num único POST falharia justamente na hora
 * em que a rede do salão está mais congestionada. Uma por vez também dá
 * progresso individual e sucesso parcial de graça.
 */

/**
 * Tamanho máximo aceito pelo servidor, por foto (4 MB).
 *
 * O navegador reduz e recomprime a imagem antes de enviar (veja
 * `lib/utils/image.ts`), então na prática cada foto chega com algumas centenas
 * de KB. Este teto é a rede de segurança para quem passar por fora.
 */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

/**
 * Tamanho máximo do arquivo ORIGINAL que o convidado escolhe no celular.
 * Acima disso nem tentamos processar, para não travar o aparelho.
 */
export const MAX_ORIGINAL_PHOTO_BYTES = 30 * 1024 * 1024;

export const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  // iPhone: normalmente o próprio iOS converte para JPEG ao anexar, mas se o
  // convidado escolher pelo app Arquivos o HEIC chega puro.
  "image/heic",
  "image/heif",
] as const;

/** Valor do atributo `accept` do input de arquivo. */
export const PHOTO_INPUT_ACCEPT = ACCEPTED_PHOTO_TYPES.join(",");

/** Maior lado da imagem depois da redução feita no navegador. */
export const PHOTO_MAX_DIMENSION = 2000;

export const guestPhotoSchema = z.object({
  /**
   * Vazio = foto anônima. Não é obrigatório de propósito: no meio da festa,
   * exigir cadastro é o jeito mais rápido de não receber foto nenhuma.
   */
  guestName: z.string().trim().max(80, "Nome muito longo.").optional().default(""),

  caption: z.string().trim().max(140, "Legenda muito longa (máx. 140).").optional().default(""),

  /** Honeypot */
  website: z.string().max(0).optional().default(""),
});

export type GuestPhotoSchema = z.infer<typeof guestPhotoSchema>;
