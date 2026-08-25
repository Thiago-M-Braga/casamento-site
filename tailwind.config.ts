import type { Config } from "tailwindcss";
import { theme } from "./config/theme";

/**
 * O Tailwind consome os tokens de `config/theme.ts`.
 * Não defina cores/fontes/sombras diretamente aqui.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    screens: { ...theme.screens },
    extend: {
      colors: {
        beige: theme.colors.beige,
        green: theme.colors.green,
        bordo: theme.colors.bordo,
        ink: theme.colors.ink,
      },
      fontFamily: {
        display: [theme.fonts.display, "Georgia", "serif"],
        body: [theme.fonts.body, "system-ui", "sans-serif"],
        script: [theme.fonts.script, "cursive"],
      },
      borderRadius: { ...theme.radius },
      boxShadow: { ...theme.shadows },
      spacing: { ...theme.spacing },
      maxWidth: {
        container: theme.sizes.container,
        "container-narrow": theme.sizes["container-narrow"],
      },
      height: { navbar: theme.sizes.navbar },
      minHeight: { navbar: theme.sizes.navbar },
      letterSpacing: {
        widest: "0.22em",
        title: "0.05em",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slow-zoom": {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.07)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 700ms ease-out both",
        "scale-in": "scale-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slow-zoom": "slow-zoom 18s ease-out forwards",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
