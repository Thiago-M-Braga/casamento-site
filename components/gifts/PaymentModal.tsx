"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { weddingConfig } from "@/config/wedding";
import { getGiftPaymentUrl, isPixAvailable } from "@/lib/payments/links";
import { buildPixPayload } from "@/lib/utils/pix";
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
};

/**
 * Modal de pagamento — PagBank.
 *
 * Ao clicar em "Pagar", o convidado vai direto para o link do PagBank daquele
 * presente (`paymentUrl` em `config/gifts.ts`), e escolhe lá dentro se paga com
 * cartão, PIX ou boleto. O site não processa pagamento nenhum.
 *
 * O PIX direto do casal continua disponível como atalho opcional, e depois de
 * pagar o convidado pode avisar em "Já fiz o pagamento".
 */
export function PaymentModal({ open, onClose, gift }: PaymentModalProps) {
  const { pixKey, pixName, pixInstructions, pagbankInstructions, pagbankName } =
    weddingConfig.payments;

  const paymentUrl = getGiftPaymentUrl(gift);
  const linkAvailable = Boolean(paymentUrl);
  const pixAvailable = isPixAvailable();

  const [step, setStep] = useState<Step>("escolha");
  const [method, setMethod] = useState<GiftPaymentMethod>("link");
  const [warning, setWarning] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setStep("escolha");
    setMethod(linkAvailable ? "link" : "pix");
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
      {/* 1. Pagar                                                            */}
      {/* =================================================================== */}
      {step === "escolha" ? (
        <div className="mt-5 animate-fade-in">
          {linkAvailable ? (
            <>
              <p className="text-sm leading-relaxed text-ink-soft">{pagbankInstructions}</p>

              <div className="mt-5">
                <ButtonLink
                  href={paymentUrl}
                  external
                  variant="primary"
                  fullWidth
                  onClick={() => setMethod("link")}
                  aria-label={`Pagar com ${pagbankName} (abre em nova aba)`}
                >
                  Pagar com {pagbankName}
                </ButtonLink>
              </div>
            </>
          ) : (
            <FormFeedback tone="info">
              O link de pagamento deste presente ainda não foi configurado.
              {pixAvailable ? " Use o PIX abaixo." : " Fale com o casal pelo WhatsApp. 🙂"}
            </FormFeedback>
          )}

          {/* PIX direto do casal, como atalho opcional */}
          {pixAvailable ? (
            <button
              type="button"
              onClick={() => {
                setMethod("pix");
                setStep("pix");
              }}
              className="link-underline mt-4 text-sm text-green-800"
            >
              Prefiro fazer um PIX direto
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
      {/* 2. PIX direto                                                       */}
      {/* =================================================================== */}
      {step === "pix" ? (
        <div className="mt-5 animate-fade-in">
          <dl className="space-y-3">
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
