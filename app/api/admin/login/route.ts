import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminToken, isAdminEnabled, passwordMatches } from "@/lib/admin/auth";
import { checkRateLimit, getClientKey } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST — autentica no painel. */
export async function POST(request: Request) {
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { ok: false, error: "O painel está desabilitado (defina ADMIN_PASSWORD)." },
      { status: 404 },
    );
  }

  // Rate limit rígido: 5 tentativas por 5 minutos.
  const limit = checkRateLimit(getClientKey(request, "admin-login"), {
    windowMs: 300_000,
    max: 5,
  });

  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!body?.password || !passwordMatches(body.password)) {
    return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: ADMIN_COOKIE,
    value: getAdminToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return response;
}

/** DELETE — sai do painel. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
