"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cancelSmoothScrollByUser, smoothScrollToElement } from "@/lib/utils/scroll";

/**
 * Intercepta cliques em links de âncora (`href="#secao"`) e faz a rolagem com
 * easing longo, em vez do salto do navegador.
 *
 * Também trata âncoras que vêm com o caminho completo (`/#presentes`) e
 * atualiza a URL sem recarregar, para o link continuar compartilhável.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      // Respeita cliques com modificador (abrir em nova aba, etc.)
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank") return;

      // Só nos interessam âncoras da própria página.
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const pathPart = href.slice(0, hashIndex);
      if (pathPart && pathPart !== pathname && pathPart !== "/") return;
      if (pathPart === "/" && pathname !== "/") return;

      const id = href.slice(hashIndex + 1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      smoothScrollToElement(target);
      window.history.pushState(null, "", `#${id}`);

      // Mantém a navegação por teclado coerente com a rolagem.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Se o visitante rolar no meio da animação, devolvemos o controle a ele.
  useEffect(() => {
    const stop = () => cancelSmoothScrollByUser();

    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);

    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, []);

  // Ao abrir o site já com um hash na URL, rola suavemente depois da montagem.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const timer = window.setTimeout(() => {
      const target = document.getElementById(id);
      if (target) smoothScrollToElement(target);
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
