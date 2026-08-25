import { theme } from "@/config/theme";

/**
 * Rolagem suave própria.
 *
 * O `scroll-behavior: smooth` nativo é rápido e com desaceleração curta, o que
 * dá a sensação de "pulo" em páginas longas. Aqui animamos manualmente com
 * `requestAnimationFrame` e um easing mais longo (ease-in-out), de forma que a
 * rolagem comece devagar, ganhe velocidade no meio e freie no final.
 *
 * A duração vem de `config/theme.ts` → `scroll.duration`.
 */

/** Altura da navbar fixa, para o alvo não ficar escondido atrás dela. */
const NAVBAR_OFFSET = 88;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let activeAnimation: number | null = null;
let animationStartedAt = 0;

/** Cancela a animação em andamento, se houver. */
export function cancelSmoothScroll() {
  if (activeAnimation !== null) {
    cancelAnimationFrame(activeAnimation);
    activeAnimation = null;
  }
}

/**
 * Cancela a animação porque o visitante assumiu o controle (roda do mouse,
 * toque, teclado). Ignora os primeiros milissegundos: eventos de inércia do
 * trackpad chegam junto com o clique e cancelariam a rolagem antes de começar.
 */
export function cancelSmoothScrollByUser() {
  if (activeAnimation === null) return;
  if (performance.now() - animationStartedAt < 140) return;
  cancelSmoothScroll();
}

export type SmoothScrollOptions = {
  /** Deslocamento extra em px (negativo sobe) */
  offset?: number;
  duration?: number;
};

export function smoothScrollToPosition(
  targetY: number,
  { duration = theme.scroll.duration }: SmoothScrollOptions = {},
) {
  cancelSmoothScroll();

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const destination = Math.max(0, Math.min(targetY, maxScroll));
  const startY = window.scrollY;
  const distance = destination - startY;

  if (Math.abs(distance) < 2) return;

  if (prefersReducedMotion() || duration <= 0) {
    window.scrollTo(0, destination);
    return;
  }

  // Trechos curtos não precisam do tempo cheio — evita parecer lento.
  const effectiveDuration = Math.min(
    duration,
    Math.max(420, (Math.abs(distance) / 1200) * duration),
  );

  const start = performance.now();
  animationStartedAt = start;

  const step = (now: number) => {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / effectiveDuration);

    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      activeAnimation = requestAnimationFrame(step);
    } else {
      activeAnimation = null;
    }
  };

  activeAnimation = requestAnimationFrame(step);
}

/** Rola até um elemento, descontando a navbar fixa. */
export function smoothScrollToElement(element: Element, options: SmoothScrollOptions = {}) {
  const top = element.getBoundingClientRect().top + window.scrollY;
  smoothScrollToPosition(top - (options.offset ?? NAVBAR_OFFSET), options);
}

/** Rola até o topo (usado ao trocar de página). */
export function smoothScrollToTop(options: SmoothScrollOptions = {}) {
  smoothScrollToPosition(0, { offset: 0, ...options });
}
