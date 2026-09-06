import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { weddingConfig } from "@/config/wedding";
import { GUEST_PHOTO_BUCKET } from "@/lib/guest-photos/storage";
import { getGuestPhotoWindow } from "@/lib/guest-photos/window";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { formatInstant } from "@/lib/utils/date";
import { slugify } from "@/lib/utils/format";
import { checkRateLimit, getClientKey } from "@/lib/utils/rate-limit";
import { looksLikeSpam, sanitizeText } from "@/lib/utils/sanitize";
import { toFieldErrors } from "@/lib/validations";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  guestPhotoSchema,
} from "@/lib/validations/guest-photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/guest-photos
 *
 * O convidado envia UMA foto tirada no casamento. Recebe `multipart/form-data`
 * com os campos: photo (arquivo), guestName, caption, width, height, website.
 *
 * Uma foto por requisição é intencional — o componente enfileira as fotos
 * selecionadas e chama esta rota em sequência. Assim cada uma tem progresso
 * próprio, uma falha isolada não derruba o lote inteiro, e nenhum corpo de
 * requisição estoura o limite das funções serverless.
 *
 * O arquivo vai para o bucket público `fotos-convidados` e o registro para
 * `guest_photos`. Se `guestPhotos.requireApproval` estiver ligado, a foto entra
 * escondida e só aparece na galeria depois que o casal aprovar no painel.
 */
export async function POST(request: Request) {
  // Limite generoso de propósito: no salão todos os convidados saem pelo MESMO
  // IP (Wi-Fi ou antena da operadora), então um teto baixo bloquearia a festa
  // inteira por causa de uma pessoa animada. Cada foto é uma requisição.
  const limit = checkRateLimit(getClientKey(request, "guest-photos"), {
    windowMs: 60_000,
    max: 40,
  });

  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas fotos de uma vez. Aguarde alguns segundos e continue." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // ---------------------------------------------------------------------------
  // Janela de envio — a palavra final é do servidor.
  //
  // A tela já esconde o botão fora do prazo, mas o relógio do celular pode
  // estar errado (ou alguém pode chamar a rota direto).
  // ---------------------------------------------------------------------------
  const uploadWindow = getGuestPhotoWindow();

  if (uploadWindow.state !== "aberto") {
    let error = "O envio de fotos não está disponível.";

    if (uploadWindow.state === "antes") {
      error = uploadWindow.opensAt
        ? `O envio de fotos abre em ${formatInstant(uploadWindow.opensAt)}, no dia do casamento.`
        : "O envio de fotos ainda não abriu.";
    } else if (uploadWindow.state === "encerrado") {
      error = uploadWindow.closesAt
        ? `O envio de fotos foi encerrado em ${formatInstant(uploadWindow.closesAt)}. Obrigado! ❤️`
        : "O envio de fotos foi encerrado. Obrigado! ❤️";
    }

    return NextResponse.json({ ok: false, error }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const raw = {
    guestName: String(form.get("guestName") ?? ""),
    caption: String(form.get("caption") ?? ""),
    website: String(form.get("website") ?? ""),
  };

  // Honeypot — bots preenchem, humanos não.
  if (raw.website.trim() !== "") {
    return NextResponse.json({ ok: true, data: { approved: true } });
  }

  const parsed = guestPhotoSchema.safeParse(raw);
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

  const guestName = parsed.data.guestName ? sanitizeText(parsed.data.guestName, 80) : "";
  const caption = parsed.data.caption ? sanitizeText(parsed.data.caption, 140) : "";

  if (caption && looksLikeSpam(caption)) {
    return NextResponse.json(
      {
        ok: false,
        error: "A legenda parece propaganda. Escreva com suas palavras, sem links.",
        fieldErrors: { caption: ["Remova links da legenda."] },
      },
      { status: 422 },
    );
  }

  // ---------------------------------------------------------------------------
  // O arquivo
  // ---------------------------------------------------------------------------
  const photo = form.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Nenhuma foto recebida. Escolha uma imagem e tente de novo." },
      { status: 422 },
    );
  }

  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Esta foto ficou grande demais para enviar. Tente outra." },
      { status: 422 },
    );
  }

  if (!ACCEPTED_PHOTO_TYPES.includes(photo.type as (typeof ACCEPTED_PHOTO_TYPES)[number])) {
    return NextResponse.json(
      { ok: false, error: "Formato não aceito. Envie uma imagem (JPG, PNG ou WEBP)." },
      { status: 422 },
    );
  }

  const width = Number(form.get("width")) || null;
  const height = Number(form.get("height")) || null;

  // Aprovação automática, a menos que o casal tenha pedido moderação.
  const approved = !weddingConfig.guestPhotos.requireApproval;

  // ---------------------------------------------------------------------------
  // Persistência
  // ---------------------------------------------------------------------------
  if (!isSupabaseAdminConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[FOTOS] Supabase não configurado — foto recebida:", {
        guestName: guestName || "(anônimo)",
        caption,
        file: `${photo.name} (${photo.size} bytes, ${photo.type})`,
      });
      return NextResponse.json({ ok: true, data: { approved } });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Não conseguimos guardar a foto agora. Se puder, manda no WhatsApp do casal. 🙏",
      },
      { status: 503 },
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar. Tente novamente em instantes." },
      { status: 503 },
    );
  }

  // Caminho por dia + sufixo aleatório: duas pessoas enviando no mesmo
  // milissegundo não colidem, e o nome não é adivinhável de fora.
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };

  const extension = extensions[photo.type] ?? "jpg";
  const who = guestName ? slugify(guestName).slice(0, 24) || "convidado" : "convidado";
  const day = new Date().toISOString().slice(0, 10);
  const storagePath = `${day}/${Date.now()}-${randomUUID().slice(0, 8)}-${who}.${extension}`;

  const upload = await supabase.storage
    .from(GUEST_PHOTO_BUCKET)
    .upload(storagePath, photo, { contentType: photo.type, upsert: false });

  if (upload.error) {
    console.error("[FOTOS] Falha ao subir foto:", upload.error.message);
    return NextResponse.json(
      {
        ok: false,
        error: "Não conseguimos guardar esta foto. Tente novamente em instantes.",
      },
      { status: 502 },
    );
  }

  const { error } = await supabase.from("guest_photos").insert({
    storage_path: upload.data.path,
    guest_name: guestName || null,
    caption: caption || null,
    approved,
    width,
    height,
    byte_size: photo.size,
    mime_type: photo.type,
  });

  if (error) {
    console.error("[FOTOS] Erro ao gravar registro:", error.message);

    // Sem registro a foto não apareceria em lugar nenhum: não deixe o arquivo
    // órfão ocupando espaço no bucket.
    await supabase.storage.from(GUEST_PHOTO_BUCKET).remove([upload.data.path]);

    return NextResponse.json(
      { ok: false, error: "Não foi possível registrar a foto. Tente novamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data: { approved } });
}
