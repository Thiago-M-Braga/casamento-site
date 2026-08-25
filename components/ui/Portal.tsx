"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renderiza o conteúdo direto no `<body>`.
 *
 * Por que isso importa: `z-index` só é comparável dentro do mesmo contexto de
 * empilhamento. Modais renderizados no meio da página herdam contextos criados
 * por `transform`, `opacity` e animações dos componentes acima deles — e aí
 * ficam atrás da navbar fixa mesmo com z-index maior. Levando o nó para o
 * `<body>`, o modal disputa empilhamento com a navbar em pé de igualdade.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // No servidor não existe `document`; só montamos depois da hidratação.
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
