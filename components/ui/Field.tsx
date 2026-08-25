import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

const control =
  "w-full rounded-md border bg-beige-50 px-4 py-3 font-body text-base text-ink placeholder:text-ink-muted/70 transition-colors duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-bordo-300/60 disabled:opacity-60";

const controlOk = "border-green-200";
const controlError = "border-red-400 bg-red-50/40";

type FieldWrapperProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** Label + dica + mensagem de erro, com ligações ARIA corretas. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-body text-sm font-medium text-green-800">
        {label}
        {required ? (
          <span className="ml-1 text-bordo-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children}

      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-ink-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className, invalid, ...rest }: InputProps) {
  return (
    <input
      className={cn(control, invalid ? controlError : controlOk, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ className, invalid, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(control, "resize-y leading-relaxed", invalid ? controlError : controlOk, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ className, invalid, children, ...rest }: SelectProps) {
  return (
    <select
      className={cn(control, "appearance-none pr-10", invalid ? controlError : controlOk, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
  );
}

/**
 * Campo isca contra bots. Fica fora da tela mas continua no DOM;
 * usuários reais nunca preenchem.
 */
export function Honeypot() {
  return (
    <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor="website">Não preencha este campo</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
