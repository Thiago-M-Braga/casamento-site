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
};

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  as: Heading = "h2",
  id,
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
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}

      <Heading
        id={id}
        className="text-3xl leading-tight tracking-title md:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </Heading>

      <span className={cn("rule", !centered && "mx-0")} aria-hidden="true" />

      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-ink-soft",
            centered && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
