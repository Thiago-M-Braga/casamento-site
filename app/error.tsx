"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";

/** Fallback de erro do lado do cliente — o convidado nunca vê uma tela branca. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro inesperado na aplicação:", error);
  }, [error]);

  return (
    <section className="flex min-h-[70dvh] items-center justify-center px-5 py-24">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <span aria-hidden="true" className="text-4xl">
          🕯️
        </span>

        <h1 className="text-3xl">Algo saiu do roteiro</h1>

        <Ornament />

        <p className="text-base leading-relaxed text-ink-soft">
          Tivemos um problema para carregar esta parte do site. Tente novamente — costuma resolver.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>Tentar de novo</Button>
          <ButtonLink href="/" variant="outline">
            Ir para o início
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
