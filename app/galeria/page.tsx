import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ButtonLink } from "@/components/ui/Button";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";
import { GuestPhotoCta } from "@/components/gallery/GuestPhotoCta";
import { galleryImages, weddingConfig } from "@/config/wedding";
import { guestPhotoAlt, guestPhotoPublicUrl } from "@/lib/guest-photos/storage";
import { getGuestPhotoWindow } from "@/lib/guest-photos/window";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import type { GalleryPhoto } from "@/types";

export const metadata: Metadata = {
  title: "Galeria",
  description: `Fotos de ${weddingConfig.couple.displayName} e o álbum coletivo feito pelos convidados no dia do casamento.`,
  alternates: { canonical: "/galeria" },
};

/**
 * As fotos dos convidados chegam durante a festa, então a página não pode ser
 * estática: quem envia uma foto precisa vê-la na galeria em seguida.
 */
export const dynamic = "force-dynamic";

/**
 * Fotos aprovadas enviadas pelos convidados, das mais novas para as mais antigas.
 *
 * Lê com a chave anônima porque a política de RLS já limita o resultado às
 * fotos liberadas (migration 0004) — a página não precisa de service role para
 * mostrar o que é público. Cai para o cliente administrativo apenas quando a
 * chave anônima não está configurada.
 *
 * Qualquer erro devolve lista vazia em vez de derrubar a página: se o banco
 * estiver fora do ar, a galeria do casal continua no ar.
 */
async function loadGuestPhotos(): Promise<GalleryPhoto[]> {
  if (!weddingConfig.features.guestPhotos) return [];

  const supabase = getSupabaseServerClient() ?? getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("guest_photos")
    .select("id, storage_path, guest_name, caption")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(400);

  if (error) {
    console.error("[GALERIA] Não foi possível carregar as fotos dos convidados:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => ({
      src: guestPhotoPublicUrl(row.storage_path),
      alt: guestPhotoAlt(row.guest_name, row.caption),
      credit: row.guest_name ?? undefined,
    }))
    // Sem NEXT_PUBLIC_SUPABASE_URL a URL sai vazia; melhor omitir do que
    // renderizar uma imagem quebrada.
    .filter((photo) => photo.src !== "");
}

export default async function GaleriaPage() {
  if (!weddingConfig.features.gallery) notFound();

  const curated: GalleryPhoto[] = [...galleryImages];
  const guest = await loadGuestPhotos();
  const uploadWindow = getGuestPhotoWindow();

  const uploadIsOpen = uploadWindow.state === "aberto";
  const showCta = uploadWindow.state !== "desligado";
  const total = curated.length + guest.length;

  return (
    <Section tone="light" className="pt-32 md:pt-40" size="lg">
      <SectionTitle
        as="h1"
        eyebrow="Momentos"
        title="Galeria"
        subtitle={
          uploadIsOpen
            ? "As fotos que os convidados enviam aparecem aqui na hora. Toque em qualquer uma para ver em tela cheia."
            : "Toque em qualquer foto para ver em tela cheia. Use as setas do teclado para navegar."
        }
        className="mb-12 md:mb-14"
      />

      {/* O convite para enviar fotos vem antes do acervo: no dia do casamento
          é a ação principal da página, não um detalhe do rodapé. */}
      {showCta ? (
        <div className="mb-14 md:mb-16">
          <GuestPhotoCta initialWindow={uploadWindow} photoCount={guest.length} />
        </div>
      ) : null}

      {total > 0 ? (
        <GalleryExplorer curated={curated} guest={guest} />
      ) : (
        <p className="py-16 text-center text-sm text-ink-muted">
          {uploadIsOpen
            ? "A galeria começa com você: envie a primeira foto da festa. ❤️"
            : "As fotos chegam em breve. ❤️"}
        </p>
      )}

      <div className="mt-16 flex flex-col items-center gap-5 text-center">
        {weddingConfig.social.hashtag ? (
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            Nas redes, marque{" "}
            <span className="text-bordo-500">#{weddingConfig.social.hashtag}</span>
          </p>
        ) : null}

        {/* A página /historia foi removida; a história vive na seção da home. */}
        <ButtonLink href="/#nossa-historia" variant="outline">
          Ver a nossa história
        </ButtonLink>
      </div>
    </Section>
  );
}
