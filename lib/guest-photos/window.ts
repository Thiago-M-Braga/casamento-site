import { weddingConfig } from "@/config/wedding";
import { getWeddingDateParts, instantFromZonedTime } from "@/lib/utils/date";
import type { GuestPhotoWindow, GuestPhotoWindowState } from "@/types";

/**
 * Quando os convidados podem enviar fotos.
 *
 * Um único lugar decide isso, porque a resposta é usada em três frentes que
 * precisam concordar entre si:
 *  - a página /galeria, para escolher o que mostrar no card de envio;
 *  - o componente do botão, que reavalia sozinho durante a festa;
 *  - a rota POST /api/guest-photos, que é a palavra final (o cliente pode
 *    estar com o relógio errado — ou de má-fé).
 *
 * As regras vivem em `config/wedding.ts` → `guestPhotos`.
 */

/** Abertura: hora escolhida do próprio dia do casamento. */
function getOpensAt(): number {
  const { year, month, day } = getWeddingDateParts();
  const hour = Math.min(23, Math.max(0, Math.trunc(weddingConfig.guestPhotos.opensAtHour)));

  return instantFromZonedTime(year, month, day, hour, 0);
}

/** Fechamento: fim do último dia do prazo (hora 24 = virada para o dia seguinte). */
function getClosesAt(): number {
  const { year, month, day } = getWeddingDateParts();
  const extraDays = Math.max(0, Math.trunc(weddingConfig.guestPhotos.closesDaysAfter));

  // `Date.UTC` resolve o estouro de mês/ano sozinho (31 + 7 → mês seguinte).
  return instantFromZonedTime(year, month, day + extraDays, 24, 0);
}

/**
 * Estado do envio de fotos agora (ou no instante informado).
 *
 * `opensAt`/`closesAt` vêm nulos quando o casal forçou o estado na
 * configuração — nesse caso não existe prazo a anunciar na tela.
 */
export function getGuestPhotoWindow(now: number = Date.now()): GuestPhotoWindow {
  if (!weddingConfig.features.guestPhotos) {
    return { state: "desligado", opensAt: null, closesAt: null };
  }

  const { mode } = weddingConfig.guestPhotos;

  if (mode === "aberto") return { state: "aberto", opensAt: null, closesAt: null };

  // "fechado" esconde o convite por completo — é o mesmo efeito prático de
  // desligar a funcionalidade, mas sem mexer na feature flag.
  if (mode === "fechado") return { state: "desligado", opensAt: null, closesAt: null };

  const opensAt = getOpensAt();
  const closesAt = getClosesAt();

  const state: GuestPhotoWindowState =
    now < opensAt ? "antes" : now > closesAt ? "encerrado" : "aberto";

  return { state, opensAt, closesAt };
}

/** Atalho para quem só precisa do sim/não (rotas de API, por exemplo). */
export function guestPhotosAreOpen(now: number = Date.now()): boolean {
  return getGuestPhotoWindow(now).state === "aberto";
}
