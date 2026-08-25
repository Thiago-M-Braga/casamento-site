import { cn } from "@/lib/utils/cn";

type FormFeedbackProps = {
  tone: "success" | "error" | "info";
  children: React.ReactNode;
  className?: string;
};

const tones = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-bordo-200 bg-bordo-100/60 text-green-800",
} as const;

/**
 * Mensagem de retorno dos formulários.
 * `role="status"` para sucesso/info e `role="alert"` para erro, de modo que
 * leitores de tela anunciem o resultado.
 */
export function FormFeedback({ tone, children, className }: FormFeedbackProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        "rounded-md border px-4 py-3 text-sm leading-relaxed",
        tones[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
