"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { weddingConfig } from "@/config/wedding";
import { buildPixPayload, isPixConfigured } from "@/lib/utils/pix";
import { formatCurrency, whatsappLink } from "@/lib/utils/format";
import { PixQrCode } from "./PixQrCode";
import { PaymentReportForm } from "./PaymentReportForm";
import type { Gift, GiftPaymentMethod } from "@/types";

/** Telas do modal, uma por vez — é o que o mantém compacto. */
type Step = "escolha" | "pix" | "aviso" | "pronto";

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  /** null = contribuição de valor livre (sem presente específico) */
  gift: Gift | null;
  /** True quando o Checkout Pro está ativo no servidor */
  mercadoPagoEnabled: boolean;
};

/**
 * Modal de pagamento.
 *
 * O caminho principal é o **link de pagamento**: é lá, no ambiente do Mercado
 * Pago, que o convidado escolhe entre cartão, boleto e PIX. O PIX direto fica
 * como alternativa secundária, para quem prefere copiar a chave.
 *
 * Depois de pagar, o convidado pode avisar em "Já fiz o pagamento", com
 * comprovante opcional e opção de ficar anônimo.
 */
export function PaymentModal({ open, onClose, gift, mercadoPagoEnabled }: PaymentModalProps) {
  const { pixKey, pixName, pixInstructions, cardInstructions, mercadoPagoLink } =
    weddingConfig.payments;

  const externalLink = gift?.paymentUrl?.trim() || mercadoPagoLink?.trim() || "";
  const linkAvailable = mercadoPagoEnabled || Boolean(externalLink);
  const pixAvailable = isPixConfigured();

  const [step, setStep] = useState<Step>("escolha");
  const [method, setMethod] = useState<GiftPaymentMethod>("link");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setStep("escolha");
    setMethod(linkAvailable ? "link" : "pix");
    setError(null);
    setLoading(false);
    setWarning(undefined);
  }, [open, linkAvailable]);

  const payload = useMemo(
    () => (gift ? buildPixPayload({ amount: gift.value, reference: gift.id }) : buildPixPayload()),
    [gift],
  );

  if (!open) return null;

  const title = gift ? gift.title : "Contribuição livre";

  const confirmMessage = gift
    ? `Oi! Acabei de enviar o presente "${gift.title}" (${formatCurrency(gift.value)}). 🎁`
    : "Oi! Acabei de enviar uma contribuição de presente. 🎁";

  /** Checkout Pro: cria a preferência no servidor e redireciona. */
  async function startCheckout() {
    if (!gift) {
      if (externalLink) window.open(externalLink, "_blank", "noopener,noreferrer");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: gift.id }),
      });

      const result = (await response.json()) as
        | { ok: true; data: { kind: "redirect"; url: string } | { kind: "pix"; payload: string } }
        | { ok: false; error: string };

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.data.kind === "redirect") {
        window.location.href = result.data.url;
        return;
      }

      setMethod("pix");
      setStep("pix");
    } catch {
      setError("Não foi possível abrir o pagamento. Tente o PIX ou fale com a gente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {gift ? (
        <p className="mt-1 text-sm text-ink-soft">
          <strong className="font-medium text-green-800">{formatCurrency(gift.value)}</strong>
        </p>
      ) : (
        <p className="mt-1 text-sm text-ink-soft">Você escolhe o valor.</p>
      )}

      {/* =================================================================== */}
      {/* 1. Escolha                                                          */}
      {/* =================================================================== */}
      {step === "escolha" ? (
        <div className="mt-5 animate-fade-in">
          {linkAvailable ? (
            <>
              <p className="text-sm leading-relaxed text-ink-soft">{cardInstructions}</p>

              <div className="mt-5">
                {mercadoPagoEnabled ? (
                  <Button variant="primary" fullWidth onClick={startCheckout} disabled={loading}>
                    {loading ? "Abrindo..." : "Ir para o pagamento"}
                  </Button>
                ) : (
                  <ButtonLink
                    href={externalLink}
                    external
                    variant="primary"
                    fullWidth
                    onClick={() => setMethod("link")}
                    aria-label="Ir para o pagamento (abre o Mercado Pago em nova aba)"
                  >
                    Ir para o pagamento
                  </ButtonLink>
                )}
              </div>

              {error ? (
                <p role="alert" className="mt-3 text-xs text-red-700">
                  {error}
                </p>
              ) : null}
            </>
          ) : (
            <FormFeedback tone="info">
              O link de pagamento ainda não foi configurado.
              {pixAvailable ? " Use o PIX abaixo." : " Fale com o casal pelo WhatsApp. 🙂"}
            </FormFeedback>
          )}

          {/* PIX como alternativa, não como padrão */}
          {pixAvailable ? (
            <button
              type="button"
              onClick={() => {
                setMethod("pix");
                setStep("pix");
              }}
              className="link-underline mt-4 text-sm text-green-800"
            >
              Prefiro pagar por PIX
            </button>
          ) : null}

          <div className="mt-6 border-t border-green-100 pt-4">
            <button
              type="button"
              onClick={() => setStep("aviso")}
              className="text-sm font-medium text-bordo-500 transition-colors hover:text-bordo-600"
            >
              Já fiz o pagamento →
            </button>
          </div>
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* 2. PIX                                                              */}
      {/* =================================================================== */}
      {step === "pix" ? (
        <div className="mt-5 animate-fade-in">
          <PixQrCode payload={payload} size={150} />

          <dl className="mt-5 space-y-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-ink-muted">Chave PIX</dt>
              <dd className="mt-1 break-all rounded-md border border-green-100 bg-beige-100 px-3 py-2 font-mono text-xs text-green-800">
                {pixKey}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-ink-muted">Recebedor</dt>
              <dd className="mt-1 text-sm text-ink">{pixName}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-col gap-2">
            <CopyButton value={pixKey} label="Copiar chave" copiedLabel="Chave copiada!" fullWidth />
            {payload ? (
              <CopyButton
                value={payload}
                label="Copiar código PIX"
                copiedLabel="Código copiado!"
                variant="outline"
                fullWidth
              />
            ) : null}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-muted">{pixInstructions}</p>

          <div className="mt-5 flex flex-col gap-2 border-t border-green-100 pt-4 sm:flex-row-reverse">
            <Button variant="bordo" fullWidth onClick={() => setStep("aviso")}>
              Já fiz o pagamento
            </Button>
            {linkAvailable ? (
              <Button variant="ghost" fullWidth onClick={() => setStep("escolha")}>
                Voltar
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* 3. Aviso de pagamento                                               */}
      {/* =================================================================== */}
      {step === "aviso" ? (
        <PaymentReportForm
          gift={gift}
          method={method}
          onCancel={() => setStep(linkAvailable ? "escolha" : "pix")}
          onDone={(receiptWarning) => {
            setWarning(receiptWarning);
            setStep("pronto");
          }}
        />
      ) : null}

      {/* =================================================================== */}
      {/* 4. Pronto                                                           */}
      {/* =================================================================== */}
      {step === "pronto" ? (
        <div className="mt-5 flex animate-fade-in flex-col items-center gap-4 text-center">
          <span aria-hidden="true" className="text-3xl">
            ❤️
          </span>

          <FormFeedback tone="success">
            Presente registrado! Obrigado de verdade — vamos conferir e agradecer direitinho.
          </FormFeedback>

          {warning ? <FormFeedback tone="info">{warning}</FormFeedback> : null}

          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      ) : null}

      {/* Atalho de contato, presente em todas as telas menos a final */}
      {step !== "pronto" && weddingConfig.contact.whatsapp ? (
        <div className="mt-4">
          <a
            href={whatsappLink(weddingConfig.contact.whatsapp, confirmMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-xs text-ink-muted"
          >
            Falar com o casal no WhatsApp
          </a>
        </div>
      ) : null}
    </Modal>
  );
}
