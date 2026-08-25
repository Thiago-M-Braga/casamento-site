import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard, type AdminData } from "@/components/admin/AdminDashboard";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { isAdminAuthenticated, isAdminEnabled, isAdminPath } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  GiftPaymentRow,
  GuestMessageRow,
  GuestRow,
  PaymentRow,
} from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Painel",
  // Fora do índice do Google e sem prévia em nenhum lugar.
  robots: { index: false, follow: false, nocache: true },
};

// Dados privados e sempre em movimento: nunca cachear.
export const dynamic = "force-dynamic";

async function loadData(): Promise<AdminData | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const [guests, messages, payments, giftPayments] = await Promise.all([
    supabase.from("guests").select("*").order("created_at", { ascending: false }).limit(500),
    supabase
      .from("guest_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(300),
    supabase
      .from("gift_payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return {
    guests: (guests.data ?? []) as GuestRow[],
    messages: (messages.data ?? []) as GuestMessageRow[],
    payments: (payments.data ?? []) as PaymentRow[],
    giftPayments: (giftPayments.data ?? []) as GiftPaymentRow[],
  };
}

/**
 * Painel do casal — /adm/<codigo>
 *
 * Duas camadas de proteção, porque aqui ficam nomes, telefones e comprovantes:
 *  1. o código na URL (quem não sabe o endereço recebe 404);
 *  2. a senha de `ADMIN_PASSWORD`.
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;

  // Código errado se comporta como página inexistente: não revela que existe painel.
  if (!isAdminPath(codigo)) notFound();

  if (!isAdminEnabled()) {
    return (
      <Section tone="light" className="pt-32 md:pt-40">
        <div className="mx-auto max-w-lg text-center">
          <SectionTitle as="h1" eyebrow="Área restrita" title="Painel desabilitado" />
          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            Defina a variável <code className="font-mono">ADMIN_PASSWORD</code> no arquivo{" "}
            <code className="font-mono">.env.local</code> (ou nas variáveis de ambiente da Vercel)
            e recarregue a página.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            Sem senha o painel fica fechado de propósito: esta página lista nomes, telefones e
            comprovantes dos convidados, e o código da URL sozinho não é proteção suficiente.
          </p>
        </div>
      </Section>
    );
  }

  if (!(await isAdminAuthenticated())) {
    return (
      <Section tone="light" className="pt-32 md:pt-40">
        <div className="mx-auto max-w-md">
          <SectionTitle as="h1" eyebrow="Área restrita" title="Painel do casal" />
          <div className="mt-10">
            <AdminLogin />
          </div>
        </div>
      </Section>
    );
  }

  const data = await loadData();

  return (
    <Section tone="light" className="pt-32 md:pt-40" size="lg">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionTitle as="h1" eyebrow="Área restrita" title="Painel do casal" align="left" />
        <AdminLogout />
      </div>

      <div className="mt-12">
        {data ? (
          <AdminDashboard {...data} />
        ) : (
          <FormFeedback tone="info">
            Supabase não configurado. Preencha{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> no{" "}
            <code className="font-mono">.env.local</code> para ver as listas aqui.
          </FormFeedback>
        )}
      </div>
    </Section>
  );
}
