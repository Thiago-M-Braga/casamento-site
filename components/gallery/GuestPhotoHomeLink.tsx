"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { getGuestPhotoWindow } from "@/lib/guest-photos/window";

/**
 * Atalho para o envio de fotos, exibido na prévia da galeria na home.
 *
 * O cálculo acontece só depois de montar no navegador, e não no servidor, por
 * um motivo prático: a home é uma página estática, gerada no build. Se o estado
 * viesse do servidor, o HTML publicado semanas antes diria para sempre "ainda
 * não abriu" — inclusive no dia do casamento.
 *
 * Por isso o botão simplesmente não existe fora da janela de envio: é mais
 * honesto do que um convite que leva a uma porta fechada.
 */
export function GuestPhotoHomeLink() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setOpen(getGuestPhotoWindow().state === "aberto");

    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!open) return null;

  return (
    <ButtonLink href="/galeria#enviar" variant="bordo">
      Enviar minhas fotos
    </ButtonLink>
  );
}
