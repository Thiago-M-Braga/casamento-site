/**
 * IDENTIDADE VISUAL — FONTE ÚNICA DE VERDADE
 * ---------------------------------------------------------------------------
 * Este arquivo é lido pelo `tailwind.config.ts`. Alterar um valor aqui muda
 * o site inteiro (utilitários do Tailwind + variáveis CSS).
 *
 * Paleta: VERDE ESCURO (primária) · BORDÔ (acento) · BEGE (fundo).
 * Os três tons foram escolhidos para funcionarem juntos: o verde e o bordô
 * são profundos e dessaturados, e o bege quente amarra os dois sem estourar
 * o contraste do texto.
 */

/**
 * Altura da navbar. Fica fora do objeto porque é usada em dois lugares
 * (`spacing.navbar`, para o `pt-navbar` do hero, e `sizes.navbar`).
 */
const NAVBAR_HEIGHT = "4.5rem";

export const theme = {
  colors: {
    /** BEGE — fundos. Quente, levemente amanteigado, nunca branco puro. */
    beige: {
      50: "#FCF9F3",
      100: "#F7F1E5",
      200: "#EFE6D4",
      300: "#E3D6BE",
      400: "#D2C1A3",
    },

    /** VERDE ESCURO — cor primária. Textos, navbar, botões e faixas. */
    green: {
      50: "#F0F3EF",
      100: "#DBE2D8",
      200: "#B5C2B0",
      300: "#8B9C85",
      400: "#63765D",
      500: "#465943",
      600: "#334333",
      700: "#25332A",
      800: "#1B2620",
      900: "#121A16",
    },

    /** BORDÔ — acento. Detalhes, rótulos, botões de destaque, ornamentos. */
    bordo: {
      50: "#FBF2F2",
      100: "#F4DEDE",
      200: "#E6BCBC",
      300: "#D19696",
      400: "#B06062",
      500: "#8E3B41",
      600: "#742C33",
      700: "#5B2129",
      800: "#43181E",
      900: "#2C0F13",
    },

    /** Texto */
    ink: {
      DEFAULT: "#2A2622",
      soft: "#57514A",
      muted: "#847B70",
    },
  },

  fonts: {
    /** Títulos e nomes do casal */
    display: "var(--font-display)",
    /** Corpo de texto e interface */
    body: "var(--font-body)",
    /** Detalhes manuscritos (frases curtas, assinaturas) */
    script: "var(--font-script)",
  },

  radius: {
    none: "0px",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.875rem",
    xl: "1.25rem",
    "2xl": "1.75rem",
    full: "9999px",
  },

  shadows: {
    soft: "0 1px 2px rgba(37, 51, 42, 0.05), 0 8px 24px -12px rgba(37, 51, 42, 0.16)",
    card: "0 2px 4px rgba(37, 51, 42, 0.05), 0 18px 40px -24px rgba(37, 51, 42, 0.24)",
    lift: "0 10px 20px -10px rgba(37, 51, 42, 0.2), 0 30px 60px -30px rgba(37, 51, 42, 0.3)",
    inset: "inset 0 0 0 1px rgba(37, 51, 42, 0.07)",
  },

  spacing: {
    /** Espaçamento vertical padrão das seções (mobile → desktop) */
    section: "5rem",
    "section-lg": "7.5rem",
    gutter: "1.25rem",
    /** Igual à altura da navbar — usado em `pt-navbar` para compensá-la */
    navbar: NAVBAR_HEIGHT,
  },

  sizes: {
    /** Largura máxima do conteúdo */
    container: "76rem",
    "container-narrow": "48rem",
    /** Altura da navbar */
    navbar: NAVBAR_HEIGHT,
  },

  /**
   * Breakpoints.
   * `xs` cobre os celulares pequenos (375 px) e `3xl` os monitores largos.
   * Os demais seguem o padrão do Tailwind de propósito: subir para duas
   * colunas antes de 640 px deixa formulários apertados em telas grandes de
   * celular (430 px).
   *
   * Larguras que a spec pede para testar: 375, 390, 430, 768, 1024, 1440, 1920.
   */
  screens: {
    xs: "375px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1440px",
    "3xl": "1920px",
  },

  transitions: {
    base: "260ms cubic-bezier(0.22, 1, 0.36, 1)",
    slow: "560ms cubic-bezier(0.22, 1, 0.36, 1)",
  },

  /** Duração da rolagem suave até âncoras, em ms (usado em lib/utils/scroll.ts) */
  scroll: {
    duration: 1000,
  },
} as const;

export type Theme = typeof theme;
