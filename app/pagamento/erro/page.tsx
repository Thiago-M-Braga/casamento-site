import type { Metadata } from "next";
import { StatusScreen } from "@/components/sections/StatusScreen";

export const metadata: Metadata = {
  title: "Pagamento não concluído",
  robots: { index: false, follow: false },
};

export default function PagamentoErroPage() {
  return (
    <StatusScreen
      emoji="😕"
      title="O pagamento não foi concluído"
      lines={[
        "Nada foi cobrado. Pode ter sido um problema com o cartão ou a operação foi cancelada.",
        "Você pode tentar de novo, escolher outro presente ou simplesmente fazer um PIX.",
      ]}
      actions={[
        { label: "Tentar de novo", href: "/presentes", variant: "primary" },
        { label: "Voltar para o início", href: "/" },
      ]}
      showSupport
    />
  );
}
