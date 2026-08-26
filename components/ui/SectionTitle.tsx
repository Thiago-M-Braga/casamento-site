import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionTitleProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
  /** Nível do heading, para manter a hierarquia semântica correta. */
  as?: "h1" | "h2" | "h3";
  id?: string;
  /**
   * Use em seções de fundo escuro (`<Section tone="green">`): inverte rótulo,
   * título, filete e subtítulo para tons de bege.
   *
   * Sem isso, o título herda o verde escuro do estilo base e some no fundo.
   */
  onDark?: boolean;
};

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  as: Heading = "h2",
  id,
  onDark = false,
}: SectionTitleProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span className={cn("eyebrow font-semibold", onDark && "text-bordo-200")}>{eyebrow}</span>
      ) : null}

      <Heading
        id={id}
        className={cn(
          "text-3xl leading-tight tracking-title md:text-4xl lg:text-[2.75rem]",
          onDark && "text-beige-50",
        )}
      >
        {title}
      </Heading>

      <span
        className={cn("rule", !centered && "mx-0", onDark && "bg-bordo-300")}
        aria-hidden="true"
      />

      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed",
            onDark ? "text-beige-200/90" : "text-ink-soft",
            centered && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
