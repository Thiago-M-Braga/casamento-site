import { weddingConfig } from "./wedding";

export type NavItem = {
  label: string;
  href: string;
  /** Quando false, o item é removido do menu (via feature flags) */
  enabled?: boolean;
};

/**
 * Navegação principal. A ordem aqui é a ordem exibida na navbar e no rodapé.
 */
export const navItems: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "O casamento", href: "/casamento" },
  { label: "Presentes", href: "/presentes", enabled: weddingConfig.features.gifts },
  { label: "Presença", href: "/rsvp", enabled: weddingConfig.features.rsvp },
  { label: "Galeria", href: "/galeria", enabled: weddingConfig.features.gallery },
];

export function getNavItems(): NavItem[] {
  return navItems.filter((item) => item.enabled !== false);
}
