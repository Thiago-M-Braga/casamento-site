/**
 * Sanitização de entradas de formulário.
 * Aplicada SEMPRE no servidor, antes de gravar no banco.
 */

/** Remove tags HTML, caracteres de controle e espaços redundantes. */
export function sanitizeText(value: string, maxLength = 500): string {
  return value
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Mantém quebras de linha (mensagens dos convidados, observações). */
export function sanitizeMultiline(value: string, maxLength = 1000): string {
  return value
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Normaliza telefone para apenas dígitos. */
export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 15);
}

/** Detecta padrões óbvios de spam (links e excesso de maiúsculas). */
export function looksLikeSpam(value: string): boolean {
  const linkCount = (value.match(/https?:\/\//gi) ?? []).length;
  if (linkCount > 0) return true;

  const letters = value.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (letters.length > 24) {
    const upper = letters.replace(/[^A-ZÀ-Þ]/g, "").length;
    if (upper / letters.length > 0.7) return true;
  }

  return false;
}
