"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Input, Textarea } from "@/components/ui/Field";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { weddingConfig } from "@/config/wedding";
import { rsvpSchema } from "@/lib/validations/rsvp";
import { toFieldErrors } from "@/lib/validations";
import { cn } from "@/lib/utils/cn";
import type { FormState } from "@/types";
import { RsvpSuccess } from "./RsvpSuccess";

type Values = {
  name: string;
  attending: "sim" | "nao" | "";
  adults: string;
  children: string;
  companions: string;
  childrenNames: string;
  email: string;
  phone: string;
  notes: string;
};

const initialValues: Values = {
  name: "",
  attending: "",
  adults: "1",
  children: "0",
  companions: "",
  childrenNames: "",
  email: "",
  phone: "",
  notes: "",
};

export function RsvpForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ name: string; attending: boolean } | null>(null);

  const attendingChosen = values.attending !== "";
  const isAttending = values.attending === "sim";

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!attendingChosen) {
      setErrors({ attending: ["Escolha uma das opções."] });
      return;
    }

    const honeypot =
      (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    const payload = {
      name: values.name,
      attending: isAttending,
      adults: isAttending ? Number(values.adults || 0) : 0,
      children: isAttending ? Number(values.children || 0) : 0,
      companions: isAttending ? values.companions : "",
      childrenNames: isAttending ? values.childrenNames : "",
      email: values.email,
      phone: values.phone,
      notes: values.notes,
      website: honeypot,
    };

    // Validação no cliente é só conveniência — o servidor valida de novo.
    const parsed = rsvpSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setState("error");
      setMessage("Confira os campos destacados.");
      return;
    }

    setState("loading");
    setMessage(null);
    setErrors({});

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as
        | { ok: true }
        | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

      if (!result.ok) {
        setState("error");
        setErrors(result.fieldErrors ?? {});
        setMessage(result.error);
        return;
      }

      setSubmitted({ name: values.name, attending: isAttending });
      setState("success");
    } catch {
      setState("error");
      setMessage("Não foi possível enviar. Verifique sua conexão e tente novamente.");
    }
  }

  if (state === "success" && submitted) {
    return <RsvpSuccess name={submitted.name} attending={submitted.attending} />;
  }

  const fieldError = (key: keyof Values) => errors[key]?.[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="relative flex flex-col gap-6">
      <Honeypot />

      <Field id="name" label="Nome completo" required error={fieldError("name")}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          value={values.name}
          invalid={Boolean(fieldError("name"))}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Como devemos chamar você"
        />
      </Field>

      {/* Presença */}
      <fieldset className="flex flex-col gap-3">
        <legend className="font-body text-sm font-medium text-green-800">
          Vai comparecer?
          <span className="ml-1 text-bordo-500" aria-hidden="true">
            *
          </span>
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { value: "sim", label: "Sim, não perco por nada" },
            { value: "nao", label: "Não vou conseguir ir" },
          ].map((option) => {
            const selected = values.attending === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3.5 text-sm transition-colors",
                  selected
                    ? "border-green-600 bg-green-50 text-green-800"
                    : "border-green-200 bg-beige-50 text-ink-soft hover:border-green-400",
                )}
              >
                <input
                  type="radio"
                  name="attending"
                  value={option.value}
                  checked={selected}
                  onChange={() => update("attending", option.value as Values["attending"])}
                  className="h-4 w-4 accent-green-700"
                />
                {option.label}
              </label>
            );
          })}
        </div>

        {fieldError("attending") ? (
          <p role="alert" className="text-xs font-medium text-red-700">
            {fieldError("attending")}
          </p>
        ) : null}
      </fieldset>

      {/* Acompanhantes — só faz sentido para quem vai */}
      {isAttending ? (
        <div className="grid animate-fade-up gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="adults"
              label="Quantidade de adultos"
              hint="Incluindo você."
              error={fieldError("adults")}
            >
              <Input
                id="adults"
                name="adults"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                value={values.adults}
                invalid={Boolean(fieldError("adults"))}
                onChange={(event) => update("adults", event.target.value)}
              />
            </Field>

            <Field id="children" label="Quantidade de crianças" error={fieldError("children")}>
              <Input
                id="children"
                name="children"
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={values.children}
                invalid={Boolean(fieldError("children"))}
                onChange={(event) => update("children", event.target.value)}
              />
            </Field>
          </div>

          <Field
            id="companions"
            label="Nome dos acompanhantes"
            hint="Separe por vírgula. Deixe em branco se vier sozinho."
            error={fieldError("companions")}
          >
            <Textarea
              id="companions"
              name="companions"
              rows={2}
              value={values.companions}
              invalid={Boolean(fieldError("companions"))}
              onChange={(event) => update("companions", event.target.value)}
            />
          </Field>

          {Number(values.children) > 0 ? (
            <Field
              id="childrenNames"
              label="Nome das crianças"
              hint="Ajuda a gente a organizar o cardápio e o espaço kids."
              error={fieldError("childrenNames")}
            >
              <Textarea
                id="childrenNames"
                name="childrenNames"
                rows={2}
                value={values.childrenNames}
                invalid={Boolean(fieldError("childrenNames"))}
                onChange={(event) => update("childrenNames", event.target.value)}
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="email" label="E-mail" error={fieldError("email")}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            invalid={Boolean(fieldError("email"))}
            onChange={(event) => update("email", event.target.value)}
            placeholder="opcional"
          />
        </Field>

        <Field id="phone" label="Telefone" error={fieldError("phone")}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            invalid={Boolean(fieldError("phone"))}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="(48) 99999-8888"
          />
        </Field>
      </div>

      <Field
        id="notes"
        label="Observações"
        hint="Restrição alimentar, recado, música que você quer ouvir na pista..."
        error={fieldError("notes")}
      >
        <Textarea
          id="notes"
          name="notes"
          value={values.notes}
          invalid={Boolean(fieldError("notes"))}
          onChange={(event) => update("notes", event.target.value)}
        />
      </Field>

      {state === "error" && message ? <FormFeedback tone="error">{message}</FormFeedback> : null}

      <p className="text-xs leading-relaxed text-ink-muted">{weddingConfig.privacy.notice}</p>

      <div>
        <Button type="submit" size="lg" disabled={state === "loading"} fullWidth className="sm:w-auto">
          {state === "loading" ? "Enviando..." : "Confirmar presença"}
        </Button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {state === "loading" ? "Enviando confirmação" : ""}
      </p>

      <p className="text-xs text-ink-muted">
        Precisa mudar a resposta depois? Envie o formulário de novo — vale sempre a última resposta.
      </p>
    </form>
  );
}
