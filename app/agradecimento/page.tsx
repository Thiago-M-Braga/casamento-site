import type { Metadata } from "next";
import { StatusScreen } from "@/components/sections/StatusScreen";
import { getGiftById } from "@/config/gifts";
import { weddingConfig } from "@/config/wedding";

export const metadata: Metadata = {
  title: "Obrigado!",
  description: "Obrigado pelo presente e pelo carinho.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Tela de agradecimento — também é a URL de retorno de sucesso do pagamento.
 * O Mercado Pago devolve `payment_id`, `status` e `external_reference`.
 */
export default async function AgradecimentoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const giftId = first(params.external_reference);
  const paymentId = first(params.payment_id);
  const gift = giftId ? getGiftById(giftId) : undefined;

  return (
    <StatusScreen
      emoji="❤️"
      title="Obrigado de coração!"
      lines={[
        gift
          ? `Recebemos o seu presente "${gift.title}". Prometemos usar com sabedoria (ou não).`
          : "Recebemos o seu presente. Prometemos usar com sabedoria (ou não).",
        `Nos vemos no grande dia. Com carinho, ${weddingConfig.couple.displayName}.`,
      ]}
      detail={
        paymentId ? (
          <>
            <strong className="font-medium text-green-800">Comprovante:</strong> pagamento{" "}
            <span className="font-mono">{paymentId}</span>. Guarde este número caso precise falar com
            a gente.
          </>
        ) : undefined
      }
      actions={[
        { label: "Voltar para o início", href: "/", variant: "primary" },
        { label: "Ver a lista de presentes", href: "/presentes" },
      ]}
    />
  );
}
