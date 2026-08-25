import { StatusScreen } from "@/components/sections/StatusScreen";

export default function NotFound() {
  return (
    <StatusScreen
      emoji="🔍"
      title="Não encontramos esta página"
      lines={[
        "O link pode estar errado ou a página foi movida.",
        "Vamos te levar de volta para um lugar conhecido.",
      ]}
      actions={[
        { label: "Ir para o início", href: "/", variant: "primary" },
        { label: "Confirmar presença", href: "/rsvp" },
      ]}
    />
  );
}
