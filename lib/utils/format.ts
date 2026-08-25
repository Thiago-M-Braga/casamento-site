/** Formatação de valores e textos (sempre pt-BR). */

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 100 → "R$ 100" · 1234.5 → "R$ 1.234,50" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** 100 → "100.00" (formato exigido pelo BR Code do PIX) */
export function formatAmountForPix(value: number): string {
  return value.toFixed(2);
}

/** Remove acentos e caracteres especiais (usado no PIX e em slugs). */
export function removeDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** "Espaço Villa" → "espaco-villa" */
export function slugify(value: string): string {
  return removeDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** "5548999998888" → "+55 (48) 99999-8888" */
export function formatWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const match = digits.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  if (!match) return raw;
  return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
}

/** Monta o link wa.me com mensagem opcional. */
export function whatsappLink(raw: string, message?: string): string {
  const digits = raw.replace(/\D/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Primeiro nome, usado nas telas de agradecimento. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/** Substitui `{nome}` e afins em templates de texto. */
export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
