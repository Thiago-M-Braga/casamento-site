"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Transição entre páginas.
 *
 * Trocar de página no menu era uma troca seca de conteúdo. Aqui o bloco novo
 * entra com um fade curto (a `key` muda a cada rota, o que remonta o conteúdo
 * e reinicia a animação). A animação respeita `prefers-reduced-motion` pela
 * regra global em `globals.css`.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
