import type { Metadata } from "next";
import { StatusScreen } from "@/components/sections/StatusScreen";

export const metadata: Metadata = {
  title: "Pagamento em análise",
  robots: { index: false, follow: false },
};

export default function PagamentoPendentePage() {
  return (
    <StatusScreen
      emoji="⏳"
      title="Pagamento em análise"
      lines={[
        "O pagamento foi registrado e está sendo processado.",
        "Assim que for aprovado, a gente recebe a confirmação automaticamente. Não precisa pagar de novo.",
      ]}
      actions={[
        { label: "Voltar para o início", href: "/", variant: "primary" },
        { label: "Ver a lista de presentes", href: "/presentes" },
      ]}
      showSupport
    />
  );
}
