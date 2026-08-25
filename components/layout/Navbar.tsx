"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getNavItems } from "@/config/navigation";
import { weddingConfig } from "@/config/wedding";
import { cn } from "@/lib/utils/cn";

const navItems = getNavItems();

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";
  // Só o topo da home tem hero escuro atrás da navbar.
  const transparent = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu ao navegar e ao voltar para desktop.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-soft",
        transparent
          ? "bg-transparent"
          : "border-b border-green-100/70 bg-beige-100/90 shadow-soft backdrop-blur-md",
      )}
    >
      <nav
        aria-label="Navegação principal"
        className="container-page flex h-navbar items-center justify-between gap-4"
      >
        <Link
          href="/"
          className={cn(
            "font-display text-base font-light tracking-widest transition-colors",
            transparent ? "text-beige-50" : "text-green-800 hover:text-bordo-500",
          )}
        >
          {weddingConfig.couple.initials}
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "link-underline text-[0.7rem] uppercase tracking-widest transition-colors",
                    transparent
                      ? "text-beige-100/90 hover:text-beige-50"
                      : "text-ink-soft hover:text-green-800",
                    active && (transparent ? "text-beige-50" : "text-green-800"),
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          className={cn(
            "-mr-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden",
            transparent ? "text-beige-50 hover:bg-beige-50/15" : "text-green-800 hover:bg-beige-200",
          )}
        >
          <span className="relative block h-3.5 w-6">
            <span
              className={cn(
                "absolute left-0 h-px w-full bg-current transition-transform duration-300 ease-soft",
                menuOpen ? "top-1/2 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1/2 h-px w-full bg-current transition-opacity duration-200",
                menuOpen ? "opacity-0" : "opacity-100",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-px w-full bg-current transition-transform duration-300 ease-soft",
                menuOpen ? "top-1/2 -rotate-45" : "top-full",
              )}
            />
          </span>
        </button>
      </nav>

      <div
        id="menu-mobile"
        hidden={!menuOpen}
        className="overflow-hidden border-t border-green-100/70 bg-beige-100 lg:hidden"
      >
        <ul className="container-page flex flex-col py-4">
          {navItems.map((item, index) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.href} className="border-b border-green-100/60 last:border-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className={cn(
                    "block animate-fade-up py-4 text-sm uppercase tracking-widest transition-colors",
                    active ? "text-bordo-500" : "text-ink-soft hover:text-green-800",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
