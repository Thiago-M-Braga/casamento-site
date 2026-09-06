"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Input, Textarea } from "@/components/ui/Field";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { weddingConfig } from "@/config/wedding";
import { formatBytes, preparePhoto } from "@/lib/utils/image";
import { cn } from "@/lib/utils/cn";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_ORIGINAL_PHOTO_BYTES,
  PHOTO_INPUT_ACCEPT,
} from "@/lib/validations/guest-photo";

type ItemStatus = "pronta" | "enviando" | "enviada" | "erro";

type UploadItem = {
  id: number;
  /** Nome do arquivo escolhido, só para o convidado se localizar na lista. */
  name: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  status: ItemStatus;
  error?: string;
};

type GuestPhotoUploadProps = {
  /** Chamado depois de pelo menos uma foto entrar, para atualizar a galeria. */
  onUploaded?: () => void;
  /** Fechar o painel/modal que envolve o formulário. */
  onClose?: () => void;
};

const MAX_PER_UPLOAD = Math.max(1, weddingConfig.guestPhotos.maxPerUpload);
const NEEDS_APPROVAL = weddingConfig.guestPhotos.requireApproval;

/**
 * Envio de fotos pelos convidados.
 *
 * Três decisões que moldam este componente, todas pensadas para uma pessoa de
 * pé no salão, com uma mão no celular e a internet do local disputada por
 * cinquenta pessoas:
 *
 *  1. As fotos são reduzidas AQUI, antes de subir (`preparePhoto`). Uma foto de
 *     celular sai com 5 MB e chega ao servidor com algumas centenas de KB.
 *     De brinde, os metadados originais são descartados — inclusive a
 *     localização GPS.
 *  2. Cada foto é uma requisição própria, enviada em fila. Uma que falhe não
 *     leva as outras embora, e é possível repetir só o que deu errado.
 *  3. Nada é obrigatório além da foto. Pedir cadastro no meio da festa é o
 *     jeito mais rápido de não receber foto nenhuma.
 */
export function GuestPhotoUpload({ onUploaded, onClose }: GuestPhotoUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [guestName, setGuestName] = useState("");
  const [caption, setCaption] = useState("");
  const [preparing, setPreparing] = useState(0);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  /** Quantas fotos já entraram na galeria nesta sessão do formulário. */
  const [sentCount, setSentCount] = useState(0);

  const fileInput = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  // O cleanup do unmount precisa da lista mais recente sem virar dependência
  // do efeito (senão ele liberaria as miniaturas a cada mudança).
  const itemsRef = useRef<UploadItem[]>([]);
  itemsRef.current = items;

  // Libera as URLs das miniaturas ao desmontar — sem isso o navegador segura
  // cada foto na memória até a aba fechar.
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
    };
  }, []);

  const addFiles = useCallback(
    async (fileList: FileList | File[] | null) => {
      const chosen = Array.from(fileList ?? []);
      if (chosen.length === 0) return;

      setFeedback(null);
      setRejected([]);

      const slots = MAX_PER_UPLOAD - itemsRef.current.length;

      if (slots <= 0) {
        setFeedback(
          `Você já selecionou ${MAX_PER_UPLOAD} fotos. Envie estas e depois escolha mais.`,
        );
        return;
      }

      const accepted = chosen.slice(0, slots);
      const overflow = chosen.length - accepted.length;
      const failed: string[] = [];

      setPreparing((current) => current + accepted.length);

      for (const file of accepted) {
        const isImage =
          file.type.startsWith("image/") ||
          ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number]);

        if (!isImage || file.size > MAX_ORIGINAL_PHOTO_BYTES) {
          failed.push(file.name);
          setPreparing((current) => Math.max(0, current - 1));
          continue;
        }

        const prepared = await preparePhoto(file);

        setPreparing((current) => Math.max(0, current - 1));

        if (!prepared) {
          failed.push(file.name);
          continue;
        }

        setItems((current) => [
          ...current,
          {
            id: nextId.current++,
            name: file.name,
            file: prepared.file,
            previewUrl: prepared.previewUrl,
            width: prepared.width,
            height: prepared.height,
            originalBytes: prepared.originalBytes,
            status: "pronta",
          },
        ]);
      }

      if (failed.length > 0) setRejected(failed);

      if (overflow > 0) {
        setFeedback(
          `Dá para enviar ${MAX_PER_UPLOAD} fotos por vez. ${overflow === 1 ? "Uma foto ficou" : `${overflow} fotos ficaram`} de fora — mande no próximo envio.`,
        );
      }

      // Permite escolher o MESMO arquivo de novo depois de removê-lo da lista.
      if (fileInput.current) fileInput.current.value = "";
    },
    [],
  );

  function removeItem(id: number) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function patchItem(id: number, patch: Partial<UploadItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const pending = items.filter((item) => item.status !== "enviada");

    if (pending.length === 0) {
      setFeedback("Escolha ao menos uma foto para enviar.");
      return;
    }

    const honeypot =
      (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    setSending(true);
    setFeedback(null);

    let succeeded = 0;
    let lastError: string | null = null;

    // Em fila, uma por vez: em rede ruim, dez requisições paralelas se atropelam
    // e o convidado fica olhando um travamento sem saber o que aconteceu.
    for (const item of pending) {
      patchItem(item.id, { status: "enviando", error: undefined });

      const body = new FormData();
      body.set("photo", item.file);
      body.set("guestName", guestName);
      body.set("caption", caption);
      body.set("width", String(item.width));
      body.set("height", String(item.height));
      body.set("website", honeypot);

      try {
        const response = await fetch("/api/guest-photos", { method: "POST", body });
        const result = (await response.json()) as
          | { ok: true; data?: { approved: boolean } }
          | { ok: false; error: string };

        if (result.ok) {
          patchItem(item.id, { status: "enviada" });
          succeeded += 1;
        } else {
          patchItem(item.id, { status: "erro", error: result.error });
          lastError = result.error;
        }
      } catch {
        const message = "Sem conexão no momento. Toque em enviar novamente.";
        patchItem(item.id, { status: "erro", error: message });
        lastError = message;
      }
    }

    setSending(false);
    setSentCount((current) => current + succeeded);

    if (succeeded > 0) onUploaded?.();

    if (succeeded > 0 && succeeded < pending.length) {
      setFeedback(
        `${succeeded} de ${pending.length} fotos foram. As marcadas em vermelho podem ser reenviadas.`,
      );
    } else if (succeeded === 0) {
      setFeedback(lastError ?? "Não conseguimos enviar agora. Tente novamente.");
    }
  }

  const pendingCount = items.filter((item) => item.status !== "enviada").length;
  const allSent = items.length > 0 && pendingCount === 0;
  const busy = sending || preparing > 0;

  // -------------------------------------------------------------------------
  // Tudo enviado: confirmação, sem o formulário no caminho.
  // -------------------------------------------------------------------------
  if (allSent) {
    return (
      <div className="mt-5 flex flex-col items-center gap-4 text-center">
        <span className="text-4xl" aria-hidden="true">
          📸
        </span>

        <div>
          <p className="font-display text-xl font-light text-green-800">
            {sentCount === 1 ? "Foto recebida!" : `${sentCount} fotos recebidas!`}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {NEEDS_APPROVAL
              ? "Obrigado! Assim que a gente der uma olhadinha, ela aparece na galeria. ❤️"
              : "Obrigado por guardar esse momento com a gente. Já está na galeria. ❤️"}
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row-reverse">
          <Button
            type="button"
            fullWidth
            onClick={() => {
              for (const item of items) URL.revokeObjectURL(item.previewUrl);
              setItems([]);
              setCaption("");
              setFeedback(null);
              setRejected([]);
            }}
          >
            Enviar mais fotos
          </Button>
          {onClose ? (
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>
              Ver a galeria
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative mt-5 flex flex-col gap-4">
      <Honeypot />

      <p className="text-sm leading-relaxed text-ink-soft">
        Escolha até {MAX_PER_UPLOAD} fotos por vez.
      </p>

      {/* ----------------------------------------------------------------- */}
      {/* Seletor de arquivos + área de arrastar                            */}
      {/* ----------------------------------------------------------------- */}
      <div>
        <input
          ref={fileInput}
          id="photos"
          name="photos"
          type="file"
          multiple
          accept={PHOTO_INPUT_ACCEPT}
          className="peer sr-only"
          disabled={busy}
          onChange={(event) => void addFiles(event.target.files)}
        />

        <label
          htmlFor="photos"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void addFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-5 py-7 text-center",
            "transition-colors duration-300 ease-soft",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-bordo-300/60",
            dragging
              ? "border-green-500 bg-green-50"
              : "border-green-300 bg-beige-50 hover:border-green-400 hover:bg-green-50/40",
            busy && "pointer-events-none opacity-60",
          )}
        >
          <span className="text-2xl" aria-hidden="true">
            🤳
          </span>
          <span className="font-body text-sm font-medium text-green-800">
            Toque para escolher as fotos
          </span>
          <span className="text-xs leading-relaxed text-ink-muted">
            JPG, PNG ou WEBP · no computador, você também pode arrastar as fotos até aqui
          </span>
        </label>
      </div>

      {preparing > 0 ? (
        <p role="status" className="text-xs text-ink-muted">
          Preparando {preparing} {preparing === 1 ? "foto" : "fotos"}...
        </p>
      ) : null}

      {rejected.length > 0 ? (
        <FormFeedback tone="error">
          Não conseguimos abrir {rejected.length === 1 ? "este arquivo" : "estes arquivos"}:{" "}
          {rejected.join(", ")}. Se for foto de iPhone, escolha pelo app Fotos (e não pelo
          Arquivos) — assim ela vem em JPG.
        </FormFeedback>
      ) : null}

      {/* ----------------------------------------------------------------- */}
      {/* Fotos selecionadas                                                */}
      {/* ----------------------------------------------------------------- */}
      {items.length > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-muted">
            {items.length} de {MAX_PER_UPLOAD} {items.length === 1 ? "foto" : "fotos"}
          </p>

          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {items.map((item) => (
              <li key={item.id} className="relative">
                <div className="relative aspect-square overflow-hidden rounded-md bg-beige-200">
                  {/* Miniatura local (blob:), então sem otimização do next/image. */}
                  <Image
                    src={item.previewUrl}
                    alt={`Pré-visualização de ${item.name}`}
                    fill
                    unoptimized
                    sizes="120px"
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      item.status === "enviando" && "opacity-40",
                      item.status === "erro" && "opacity-60",
                    )}
                  />

                  {item.status === "enviada" ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-green-900/55 text-lg text-beige-50">
                      <span aria-hidden="true">✓</span>
                      <span className="sr-only">Foto enviada</span>
                    </span>
                  ) : null}

                  {item.status === "enviando" ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-beige-50/40 border-t-beige-50" />
                      <span className="sr-only">Enviando</span>
                    </span>
                  ) : null}

                  {item.status === "erro" ? (
                    <span className="absolute inset-x-0 bottom-0 bg-red-700/85 px-1 py-0.5 text-center text-[0.6rem] uppercase tracking-widest text-beige-50">
                      Falhou
                    </span>
                  ) : null}

                  {item.status === "pronta" && !sending ? (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remover ${item.name}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-900/70 text-beige-50 transition-colors hover:bg-bordo-600"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                      </svg>
                    </button>
                  ) : null}
                </div>

                <p className="mt-1 truncate text-[0.65rem] text-ink-muted" title={item.name}>
                  {formatBytes(item.file.size)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ----------------------------------------------------------------- */}
      {/* Quem enviou                                                       */}
      {/* ----------------------------------------------------------------- */}
      <Field
        id="guestName"
        label="Seu nome (opcional)"
        hint="Aparece como crédito da foto. Deixe em branco para enviar sem assinar."
      >
        <Input
          id="guestName"
          name="guestName"
          autoComplete="name"
          maxLength={80}
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Como você quer ser creditado"
        />
      </Field>

      <Field
        id="caption"
        label="Legenda (opcional)"
        hint="Vale para todas as fotos deste envio."
      >
        <Textarea
          id="caption"
          name="caption"
          rows={2}
          maxLength={140}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Ex.: a hora da entrada da noiva"
        />
      </Field>

      {feedback ? <FormFeedback tone="error">{feedback}</FormFeedback> : null}

      <p className="text-xs leading-relaxed text-ink-muted">
        As fotos entram na galeria pública do site, onde qualquer convidado pode ver.
      </p>

      <div className="mt-1 flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" disabled={busy || pendingCount === 0} fullWidth>
          {sending
            ? "Enviando..."
            : pendingCount > 1
              ? `Enviar ${pendingCount} fotos`
              : "Enviar foto"}
        </Button>
        {onClose ? (
          <Button type="button" variant="ghost" fullWidth onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
