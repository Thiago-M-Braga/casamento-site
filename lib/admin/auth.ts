import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { weddingConfig } from "@/config/wedding";

/**
 * Autenticação mínima do painel `/admin`.
 *
 * Uma senha única em `ADMIN_PASSWORD` (variável de ambiente do servidor).
 * O cookie guarda apenas um hash derivado da senha — a senha em si nunca
 * chega ao navegador. É suficiente para um painel de leitura usado por duas
 * pessoas; se um dia houver mais gente, troque por Supabase Auth.
 */

export const ADMIN_COOKIE = "casamento_admin";

export function isAdminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

/**
 * Confere o código da URL (/adm/<codigo>).
 *
 * Pode ser sobrescrito por `ADMIN_SECRET_PATH` no ambiente, para trocar o
 * endereço do painel sem alterar o código-fonte.
 */
export function isAdminPath(codigo: string): boolean {
  const expected = (process.env.ADMIN_SECRET_PATH?.trim() ||
    weddingConfig.admin.secretPath) as string;

  return codigo === expected;
}

export function getAdminPath(): string {
  const code = process.env.ADMIN_SECRET_PATH?.trim() || weddingConfig.admin.secretPath;
  return `/adm/${code}`;
}

/** Token derivado da senha. Muda automaticamente se a senha mudar. */
export function getAdminToken(): string {
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  return createHash("sha256").update(`casamento:${password}`).digest("hex");
}

export function passwordMatches(attempt: string): boolean {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD?.trim() ?? "");
  const received = Buffer.from(attempt.trim());

  if (expected.length === 0 || expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminEnabled()) return false;

  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const expected = Buffer.from(getAdminToken());
  const received = Buffer.from(token);

  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
