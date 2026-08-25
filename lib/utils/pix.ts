import { weddingConfig } from "@/config/wedding";
import { formatAmountForPix, removeDiacritics } from "./format";

/**
 * Geração do BR Code (PIX "copia e cola") no padrão EMV MPM do Banco Central.
 * Sem dependências externas: apenas concatenação de campos + CRC16.
 */

function field(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

function sanitizeText(value: string, maxLength: number): string {
  return removeDiacritics(value)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** CRC16/CCITT-FALSE — polinômio 0x1021, valor inicial 0xFFFF. */
function crc16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export type PixPayloadOptions = {
  /** Valor em reais. Omita para deixar o convidado escolher no app do banco. */
  amount?: number;
  /** Identificador da transação (txid). Máx. 25 caracteres alfanuméricos. */
  reference?: string;
};

/**
 * Monta o payload PIX a partir da chave configurada em
 * `weddingConfig.payments`. Retorna string vazia se a chave não estiver definida.
 */
export function buildPixPayload({ amount, reference }: PixPayloadOptions = {}): string {
  const { pixKey, pixName, pixCity } = weddingConfig.payments;
  if (!pixKey) return "";

  const merchantAccount =
    field("00", "br.gov.bcb.pix") + field("01", pixKey.trim());

  const txid = reference
    ? sanitizeText(reference, 25).replace(/ /g, "") || "***"
    : "***";

  let payload =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    (typeof amount === "number" && amount > 0
      ? field("54", formatAmountForPix(amount))
      : "") +
    field("58", "BR") +
    field("59", sanitizeText(pixName || "RECEBEDOR", 25)) +
    field("60", sanitizeText(pixCity || "BRASIL", 15)) +
    field("62", field("05", txid));

  payload += "6304";

  return payload + crc16(payload);
}

/** True quando o casal já configurou a chave PIX. */
export function isPixConfigured(): boolean {
  return Boolean(weddingConfig.payments.pixKey?.trim());
}
