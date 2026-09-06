/**
 * Onde as fotos dos convidados ficam guardadas.
 *
 * O bucket é PÚBLICO, ao contrário do `comprovantes`. É uma escolha
 * consciente: a galeria é uma página aberta, e URL assinada expira — as fotos
 * parariam de carregar sozinhas depois de alguns minutos, além de impedir
 * qualquer cache de imagem. O que protege a privacidade aqui é o caminho ser
 * imprevisível e nada além das fotos morar neste bucket.
 *
 * Criado pela migration `supabase/migrations/0004_guest_photos.sql`.
 */
export const GUEST_PHOTO_BUCKET = "fotos-convidados";

/**
 * URL pública de um arquivo do bucket.
 *
 * Lê a variável de ambiente direto (em vez de `lib/supabase/config.ts`) para
 * poder ser usada também em Client Components, sem arrastar a service role key
 * para o pacote do navegador.
 */
export function guestPhotoPublicUrl(storagePath: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  if (!base) return "";

  return `${base}/storage/v1/object/public/${GUEST_PHOTO_BUCKET}/${encodeURI(storagePath)}`;
}

/**
 * Texto alternativo da foto — é o que o leitor de tela anuncia e o que aparece
 * na legenda do visualizador. Nunca deve ficar vazio.
 */
export function guestPhotoAlt(guestName: string | null, caption: string | null): string {
  if (caption) return caption;
  if (guestName) return `Foto do casamento enviada por ${guestName}`;
  return "Foto do casamento enviada por um convidado";
}
