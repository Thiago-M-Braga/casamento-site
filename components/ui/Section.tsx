import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Fundo alternativo para criar ritmo entre as seções */
  tone?: "beige" | "light" | "green" | "bordo";
  size?: "md" | "lg";
  /** Usa <section> por padrão; permite <div> quando já existe um landmark. */
  as?: "section" | "div";
  "aria-labelledby"?: string;
};

const tones: Record<NonNullable<SectionProps["tone"]>, string> = {
  /** Bege padrão */
  beige: "bg-beige-100 text-ink",
  /** Bege mais claro, para alternar o ritmo entre seções */
  light: "bg-beige-50 text-ink",
  /** Faixa em verde escuro */
  green: "bg-green-800 text-beige-100",
  /** Faixa em bordô suave */
  bordo: "bg-bordo-50 text-ink",
};

export function Section({
  id,
  children,
  className,
  tone = "beige",
  size = "md",
  as: Tag = "section",
  ...rest
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        tones[tone],
        size === "lg" ? "py-20 md:py-section-lg" : "py-16 md:py-section",
        className,
      )}
      {...rest}
    >
      <div className="container-page">{children}</div>
    </Tag>
  );
}
