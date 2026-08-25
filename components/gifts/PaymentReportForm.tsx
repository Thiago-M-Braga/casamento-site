"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Input, Textarea } from "@/components/ui/Field";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { weddingConfig } from "@/config/wedding";
import { MAX_RECEIPT_BYTES } from "@/lib/validations/gift-payment";
import { cn } from "@/lib/utils/cn";
import type { FormState, Gift, GiftPaymentMethod } from "@/types";

type PaymentReportFormProps = {
  gift: Gift | null;
  method: GiftPaymentMethod;
  onDone: (warning?: string) => void;
  onCancel: () => void;
};

/**
 * "Pagamento realizado".
 *
 * Links de pagamento reutilizáveis e PIX não dizem quem pagou o quê, então
 * pedimos ao convidado que avise. O comprovante é **opcional**: dá para
 * registrar só com o nome, ou até anônimo.
 */
export function PaymentReportForm({ gift, method, onDone, onCancel }: PaymentReportFormProps) {
  const [payerName, setPayerName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function pickFile(file: File | null) {
    setErrors((current) => ({ ...current, receipt: [] }));

    if (file && file.size > MAX_RECEIPT_BYTES) {
      setErrors((current) => ({ ...current, receipt: ["Arquivo muito grande (máx. 5 MB)."] }));
      setReceipt(null);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    setReceipt(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!anonymous && payerName.trim().length < 2) {
      setErrors({ payerName: ["Informe seu nome ou marque a opção Anônimo."] });
      return;
    }

    const honeypot =
      (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    const body = new FormData();
    body.set("giftId", gift?.id ?? "");
    body.set("payerName", anonymous ? "" : payerName);
    body.set("anonymous", String(anonymous));
    body.set("method", method);
    body.set("message", message);
    body.set("website", honeypot);
    if (receipt) body.set("receipt", receipt);

    setState("loading");
    setErrors({});
    setFeedback(null);

    try {
      const response = await fetch("/api/gift-payments", { method: "POST", body });

      const result = (await response.json()) as
        | { ok: true; warning?: string }
        | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

      if (!result.ok) {
        setState("error");
        setErrors(result.fieldErrors ?? {});
        setFeedback(result.error);
        return;
      }

      onDone(result.warning);
    } catch {
      setState("error");
      setFeedback("Não foi possível registrar. Verifique sua conexão e tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative mt-5 flex flex-col gap-4">
      <Honeypot />

      <p className="text-sm leading-relaxed text-ink-soft">
        Assim a gente sabe de quem veio o presente. O comprovante é opcional.
      </p>

      <Field
        id="payerName"
        label="Seu nome"
        required={!anonymous}
        error={errors.payerName?.[0]}
      >
        <Input
          id="payerName"
          name="payerName"
          autoComplete="name"
          value={anonymous ? "" : payerName}
          disabled={anonymous}
          invalid={Boolean(errors.payerName?.length)}
          onChange={(event) => setPayerName(event.target.value)}
          placeholder={anonymous ? "Vai ficar como Anônimo" : "Como devemos agradecer"}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => {
            setAnonymous(event.target.checked);
            setErrors({});
          }}
          className="h-4 w-4 accent-green-700"
        />
        Prefiro ficar anônimo
      </label>

      {/* Comprovante — opcional */}
      <Field
        id="receipt"
        label="Comprovante (opcional)"
        hint="Imagem ou PDF, até 5 MB."
        error={errors.receipt?.[0]}
      >
        <input
          ref={fileInput}
          id="receipt"
          name="receipt"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          className={cn(
            "w-full rounded-md border border-green-200 bg-beige-50 px-3 py-2.5 text-sm text-ink-soft",
            "file:mr-3 file:rounded-full file:border-0 file:bg-green-700 file:px-4 file:py-2",
            "file:text-xs file:uppercase file:tracking-widest file:text-beige-50",
            "hover:file:bg-green-600 file:transition-colors file:duration-300",
          )}
        />
      </Field>

      <Field id="message" label="Recado (opcional)">
        <Textarea
          id="message"
          name="message"
          rows={2}
          maxLength={600}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Aproveite e deixe um recado."
        />
      </Field>

      {state === "error" && feedback ? <FormFeedback tone="error">{feedback}</FormFeedback> : null}

      <p className="text-xs leading-relaxed text-ink-muted">{weddingConfig.privacy.notice}</p>

      <div className="mt-1 flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" disabled={state === "loading"} fullWidth>
          {state === "loading" ? "Registrando..." : "Pagamento realizado"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
          Voltar
        </Button>
      </div>
    </form>
  );
}
