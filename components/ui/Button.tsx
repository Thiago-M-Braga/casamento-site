import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "outline" | "ghost" | "bordo";
type Size = "sm" | "md" | "lg";

/**
 * Animação dos botões (pedido do casal):
 * - cresce bem de leve no hover (`scale-[1.035]`) e afunda no clique;
 * - cor, sombra e borda transicionam juntas, com duração generosa e easing
 *   suave, para nada "piscar" de um estado para o outro;
 * - `motion-reduce:` desliga o movimento para quem pediu menos animação.
 */
const base = [
  "inline-flex items-center justify-center gap-2 font-body uppercase tracking-widest",
  "transition-[background-color,border-color,color,box-shadow,transform,opacity]",
  "duration-500 ease-soft will-change-transform",
  "hover:scale-[1.035] active:scale-[0.985] active:duration-150",
  "motion-reduce:transform-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100",
].join(" ");

const variants: Record<Variant, string> = {
  primary:
    "bg-green-400 text-beige-50 shadow-soft hover:bg-green-600 hover:shadow-lift",
  outline:
    "border border-green-300 bg-transparent text-green-600 hover:border-green-400 hover:bg-green-400 hover:text-beige-50 hover:shadow-soft",
  bordo:
    "bg-bordo-600 text-beige-50 shadow-soft hover:bg-bordo-700 hover:shadow-lift",
  ghost: "text-green-700 hover:text-green-800",
};

const sizes: Record<Size, string> = {
  sm: "rounded-full px-4 py-2 text-[0.65rem]",
  md: "rounded-full px-6 py-3 text-[0.7rem]",
  lg: "rounded-full px-8 py-4 text-xs",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: Omit<CommonProps, "children">): string {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps & {
  href: string;
  /** Abre em nova aba com rel seguro */
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function ButtonLink({
  href,
  external = false,
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, fullWidth, className });

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
