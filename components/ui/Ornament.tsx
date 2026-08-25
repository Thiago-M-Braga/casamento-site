import { cn } from "@/lib/utils/cn";

/** Divisor decorativo com folha central. Puramente visual. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-3 text-bordo-300", className)}
    >
      <span className="h-px w-12 bg-current opacity-60 sm:w-20" />
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 3c3.2 2.6 5 5.4 5 8.4 0 3.4-2.2 6.1-5 9.6-2.8-3.5-5-6.2-5-9.6 0-3 1.8-5.8 5-8.4Z" />
        <path d="M12 6v13" strokeOpacity="0.5" />
      </svg>
      <span className="h-px w-12 bg-current opacity-60 sm:w-20" />
    </div>
  );
}

/** Monograma com as iniciais do casal. */
export function Monogram({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-display text-lg font-light tracking-title text-green-800",
        className,
      )}
    >
      {initials}
    </span>
  );
}
