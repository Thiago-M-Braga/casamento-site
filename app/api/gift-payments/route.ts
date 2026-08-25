import { NextResponse } from "next/server";
import { getGiftById } from "@/config/gifts";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { checkRateLimit, getClientKey } from "@/lib/utils/rate-limit";
import { sanitizeMultiline, sanitizeText } from "@/lib/utils/sanitize";
import { slugify } from "@/lib/utils/format";
import { toFieldErrors } from "@/lib/validations";
import {
  ACCEPTED_RECEIPT_TYPES,
  MAX_RECEIPT_BYTES,
  giftPaymentSchema,
} from "@/lib/validations/gift-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECEIPT_BUCKET = "comprovantes";

/**
 * POST /api/gift-payments
 *
 * O convidado avisa que pagou um presente. Recebe `multipart/form-data`
 * porque o comprovante é opcional e vem como arquivo.
 *
 * Campos: giftId, payerName, anonymous, method, message, receipt (arquivo).
 *
 * O comprovante vai para um bucket PRIVADO do Supabase Storage; o painel do
 * casal abre por URL assinada. Se o Storage falhar, o aviso é gravado sem o
 * arquivo — melhor registrar o presente do que perder a informação toda.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(getClientKey(request, "gift-payments"), {
    windowMs: 60_000,
    max: 6,
  });

  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Muitos envios em pouco tempo. Aguarde um instante." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const raw = {
    giftId: String(form.get("giftId") ?? ""),
    payerName: String(form.get("payerName") ?? ""),
    anonymous: String(form.get("anonymous") ?? "") === "true",
    method: String(form.get("method") ?? "link"),
    message: String(form.get("message") ?? ""),
    website: String(form.get("website") ?? ""),
  };

  // Honeypot — bots preenchem, humanos não.
  if (raw.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = giftPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Confira os campos destacados.",
        fieldErrors: toFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const gift = data.giftId ? getGiftById(data.giftId) : undefined;

  // O valor vem da nossa configuração, nunca do cliente.
  const amount = gift?.value ?? 0;

  const record = {
    gift_id: gift?.id ?? null,
    gift_title: gift?.title ?? (data.giftId ? null : "Contribuição livre"),
    amount,
    payer_name: data.anonymous ? null : sanitizeText(data.payerName, 120),
    anonymous: data.anonymous,
    method: data.method,
    message: data.message ? sanitizeMultiline(data.message, 600) : null,
    receipt_path: null as string | null,
  };

  // ---------------------------------------------------------------------------
  // Comprovante (opcional)
  // ---------------------------------------------------------------------------
  const receipt = form.get("receipt");
  const hasReceipt = receipt instanceof File && receipt.size > 0;

  if (hasReceipt) {
    if (receipt.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: "O comprovante passou de 5 MB. Envie uma imagem menor ou um PDF.",
          fieldErrors: { receipt: ["Arquivo muito grande (máx. 5 MB)."] },
        },
        { status: 422 },
      );
    }

    if (!ACCEPTED_RECEIPT_TYPES.includes(receipt.type as (typeof ACCEPTED_RECEIPT_TYPES)[number])) {
      return NextResponse.json(
        {
          ok: false,
          error: "Formato não aceito. Envie uma imagem (JPG, PNG, WEBP) ou um PDF.",
          fieldErrors: { receipt: ["Formato não aceito."] },
        },
        { status: 422 },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Persistência
  // ---------------------------------------------------------------------------
  if (!isSupabaseAdminConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[PRESENTE] Supabase não configurado — aviso recebido:", {
        ...record,
        receipt: hasReceipt ? `${receipt.name} (${receipt.size} bytes)` : null,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Não conseguimos registrar agora. Manda um print no WhatsApp do casal, por favor. 🙏",
      },
      { status: 503 },
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Não foi possível registrar. Tente novamente em instantes." },
      { status: 503 },
    );
  }

  let receiptWarning: string | undefined;

  if (hasReceipt) {
    const extension = receipt.name.includes(".")
      ? receipt.name.split(".").pop()!.toLowerCase().slice(0, 5)
      : "bin";

    const who = record.anonymous ? "anonimo" : slugify(record.payer_name ?? "convidado");
    const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${
      gift?.id ?? "livre"
    }-${who}.${extension}`;

    const upload = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, receipt, { contentType: receipt.type, upsert: false });

    if (upload.error) {
      console.error("[PRESENTE] Falha ao subir comprovante:", upload.error.message);
      receiptWarning =
        "Registramos o seu presente, mas não conseguimos guardar o comprovante. Se puder, manda no WhatsApp.";
    } else {
      record.receipt_path = upload.data.path;
    }
  }

  const { error } = await supabase.from("gift_payments").insert(record);

  if (error) {
    console.error("[PRESENTE] Erro ao gravar aviso:", error.message);
    return NextResponse.json(
      { ok: false, error: "Não foi possível registrar. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, warning: receiptWarning });
}
