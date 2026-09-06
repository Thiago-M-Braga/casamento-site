"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getGuestPhotoWindow } from "@/lib/guest-photos/window";
import { formatInstant, formatInstantHour } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { GuestPhotoWindow } from "@/types";
import { GuestPhotoUpload } from "./GuestPhotoUpload";

type GuestPhotoCtaProps = {
  /** Estado calculado no servidor, para a primeira pintura já vir correta. */
  initialWindow: GuestPhotoWindow;
  /** Quantas fotos de convidados já estão na galeria. */
  photoCount: number;
};

/** De quanto em quanto tempo reavaliamos se o envio abriu/fechou. */
const RECHECK_MS = 30_000;

/**
 * O convite para os convidados mandarem as fotos deles.
 *
 * É o elemento mais importante da página no dia do casamento, e por isso muda
 * de cara conforme o momento:
 *
 *  - antes do dia     → explica o que vai acontecer, sem botão ativo;
 *  - no dia (aberto)   → convite em destaque, com o botão de envio;
 *  - depois do prazo   → agradecimento, e a galeria segue no ar.
 *
 * O estado chega calculado do servidor e continua sendo reavaliado no cliente:
 * quem deixar a página aberta desde a véspera vê o botão aparecer sozinho na
 * virada, sem precisar recarregar.
 */
export function GuestPhotoCta({ initialWindow, photoCount }: GuestPhotoCtaProps) {
  const router = useRouter();
  const [uploadWindow, setUploadWindow] = useState(initialWindow);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Só faz sentido observar a virada enquanto ela ainda pode acontecer.
    if (uploadWindow.state === "desligado" || uploadWindow.state === "encerrado") return;

    const check = () => {
      const next = getGuestPhotoWindow();
      setUploadWindow((current) => (current.state === next.state ? current : next));
    };

    const timer = window.setInterval(check, RECHECK_MS);
    return () => window.clearInterval(timer);
  }, [uploadWindow.state]);

  if (uploadWindow.state === "desligado") return null;

  const isOpen = uploadWindow.state === "aberto";

  return (
    <>
      <section
        id="enviar"
        aria-labelledby="enviar-titulo"
        // `scroll-mt` compensa a navbar fixa quando alguém chega por /galeria#enviar.
        className={cn(
          "relative overflow-hidden scroll-mt-28 rounded-lg border p-6 shadow-soft md:p-8",
          isOpen
            ? "border-bordo-300 bg-beige-50 shadow-lift"
            : "border-green-100/70 bg-beige-50/70",
        )}
      >
        <div className="texture-soft absolute inset-0" aria-hidden="true" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl",
                isOpen ? "bg-bordo-100" : "bg-green-100",
              )}
              aria-hidden="true"
            >
              {uploadWindow.state === "encerrado" ? "💛" : "📸"}
            </span>

            <div>
              <p className="eyebrow font-semibold">
                {isOpen ? "Ao vivo" : uploadWindow.state === "antes" ? "No dia do casamento" : "Obrigado"}
              </p>

              <h2
                id="enviar-titulo"
                className="mt-2 font-display text-2xl font-light leading-snug text-green-800 md:text-[1.75rem]"
              >
                {isOpen
                  ? "Mande as fotos que você tirou"
                  : uploadWindow.state === "antes"
                    ? "A galeria vai ser escrita por você também"
                    : "O álbum coletivo está fechado"}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                {isOpen ? (
                  <>
                    Cada convidado vê o casamento de um ângulo que a gente nunca vai ver. Envie as
                    suas fotos e elas entram nesta galeria na mesma hora.
                    {uploadWindow.closesAt ? (
                      <> O envio fica aberto até {formatInstant(uploadWindow.closesAt)}.</>
                    ) : null}
                  </>
                ) : uploadWindow.state === "antes" ? (
                  <>
                    No dia do casamento, este espaço libera um botão para você enviar as fotos que
                    tirar durante a celebração — e todas elas ficam guardadas aqui, junto com as
                    nossas.
                    {uploadWindow.opensAt ? (
                      <>
                        {" "}
                        Abre em <strong className="font-medium">
                          {formatInstant(uploadWindow.opensAt)}
                        </strong>
                        , a partir das {formatInstantHour(uploadWindow.opensAt)}.
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    O prazo de envio se encerrou
                    {uploadWindow.closesAt ? <> em {formatInstant(uploadWindow.closesAt)}</> : null}
                    , mas tudo que chegou continua aqui. Obrigado por olhar o nosso casamento com
                    tanto carinho. ❤️
                  </>
                )}
              </p>

              {photoCount > 0 ? (
                <p className="mt-3 text-xs uppercase tracking-widest text-ink-muted">
                  <span className="tabular">{photoCount}</span>{" "}
                  {photoCount === 1 ? "foto enviada por convidados" : "fotos enviadas por convidados"}
                </p>
              ) : null}
            </div>
          </div>

          {isOpen ? (
            <Button
              type="button"
              variant="bordo"
              size="lg"
              className="w-full shrink-0 md:w-auto"
              onClick={() => setOpen(true)}
            >
              Enviar minhas fotos
            </Button>
          ) : null}
        </div>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Enviar minhas fotos"
        size="md"
        // O formulário tem grade de miniaturas: precisa de mais largura que o padrão.
        className="sm:max-w-xl"
      >
        <GuestPhotoUpload
          onUploaded={() => router.refresh()}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
