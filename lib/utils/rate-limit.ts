/**
 * Rate limiting básico em memória.
 *
 * Suficiente para um site de casamento (tráfego baixo, poucas instâncias).
 * Em escala maior, troque por Upstash Redis / Vercel KV mantendo a mesma
 * assinatura de `checkRateLimit`.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export type RateLimitOptions = {
  /** Janela em milissegundos */
  windowMs?: number;
  /** Máximo de requisições permitidas na janela */
  max?: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** Segundos até liberar novamente */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  { windowMs = 60_000, max = 5 }: RateLimitOptions = {},
): RateLimitResult {
  const now = Date.now();

  // Evita crescimento indefinido do mapa em execuções longas.
  if (buckets.size > MAX_KEYS) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((hit) => now - hit < windowMs);

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0] ?? now;
    buckets.set(key, bucket);
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  return { success: true, remaining: max - bucket.hits.length, retryAfter: 0 };
}

/** Extrai um identificador de cliente a partir dos headers da requisição. */
export function getClientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `${scope}:${ip}`;
}
