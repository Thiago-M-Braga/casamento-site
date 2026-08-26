import { formatCurrency } from "@/lib/utils/format";
import { GiftPaymentsTable } from "./GiftPaymentsTable";
import type { GiftPaymentRow, GuestMessageRow, GuestRow } from "@/lib/supabase/types";

export type AdminData = {
  guests: GuestRow[];
  messages: GuestMessageRow[];
  /**
   * Presentes comprados, avisados pelos próprios convidados.
   *
   * Com pagamento por link do PagBank não existe confirmação automática — quem
   * fecha o ciclo é o casal, marcando "conferido" após bater com o extrato.
   */
  giftPayments: GiftPaymentRow[];
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="surface p-5">
      <p className="text-xs uppercase tracking-widest text-ink-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-light text-green-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

/** Painel de leitura: números do RSVP, presentes comprados e mensagens. */
export function AdminDashboard({ guests, messages, giftPayments }: AdminData) {
  const confirmed = guests.filter((guest) => guest.attending);
  const declined = guests.filter((guest) => !guest.attending);

  const adults = confirmed.reduce((total, guest) => total + (guest.adults ?? 0), 0);
  const children = confirmed.reduce((total, guest) => total + (guest.children ?? 0), 0);

  // Os presentes são pagos por link do PagBank, então o site não recebe
  // confirmação automática: o total vem dos avisos dos próprios convidados.
  const raisedFromGuests = giftPayments.reduce(
    (total, row) => total + Number(row.amount ?? 0),
    0,
  );
  const checkedGifts = giftPayments.filter((row) => row.confirmed);
  const raisedChecked = checkedGifts.reduce((total, row) => total + Number(row.amount ?? 0), 0);

  const giftsPendingCheck = giftPayments.filter((row) => !row.confirmed);
  const pendingMessages = messages.filter((message) => !message.approved);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Respostas" value={String(guests.length)} hint="Total de formulários enviados" />
        <Stat label="Confirmados" value={String(confirmed.length)} />
        <Stat label="Não vão" value={String(declined.length)} />
        <Stat
          label="Pessoas esperadas"
          value={String(adults + children)}
          hint={`${adults} adultos · ${children} crianças`}
        />
        <Stat
          label="Presentes comprados"
          value={String(giftPayments.length)}
          hint={
            giftsPendingCheck.length > 0
              ? `${giftsPendingCheck.length} a conferir`
              : "todos conferidos"
          }
        />
        <Stat
          label="Valor declarado"
          value={formatCurrency(raisedFromGuests)}
          hint="Somatório de todos os avisos"
        />
        <Stat
          label="Valor conferido"
          value={formatCurrency(raisedChecked)}
          hint={`${checkedGifts.length} de ${giftPayments.length} conferido(s)`}
        />
        <Stat
          label="Mensagens"
          value={String(messages.length)}
          hint={
            pendingMessages.length > 0
              ? `${pendingMessages.length} aguardando moderação`
              : "todas moderadas"
          }
        />
      </div>

      {/* Presentes comprados */}
      <section>
        <h2 className="mb-2 text-2xl">Presentes comprados</h2>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Cada linha é um aviso enviado pelo convidado depois de pagar, com o comprovante quando ele
          escolheu anexar.
        </p>

        <GiftPaymentsTable rows={giftPayments} />
      </section>

      {/* Convidados */}
      <section>
        <h2 className="mb-4 text-2xl">Confirmações</h2>

        {guests.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhuma confirmação ainda.</p>
        ) : (
          <div className="scrollbar-thin overflow-x-auto rounded-lg border border-green-100">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">Lista de confirmações de presença</caption>
              <thead className="bg-beige-200/60 text-left text-xs uppercase tracking-widest text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                  <th scope="col" className="px-4 py-3 font-medium">Vai?</th>
                  <th scope="col" className="px-4 py-3 font-medium">Adultos</th>
                  <th scope="col" className="px-4 py-3 font-medium">Crianças</th>
                  <th scope="col" className="px-4 py-3 font-medium">Contato</th>
                  <th scope="col" className="px-4 py-3 font-medium">Observações</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-t border-green-100 align-top">
                    <td className="px-4 py-3 font-medium text-green-800">
                      {guest.name}
                      {guest.companions ? (
                        <span className="mt-1 block text-xs font-normal text-ink-muted">
                          {guest.companions}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{guest.attending ? "Sim" : "Não"}</td>
                    <td className="px-4 py-3 tabular">{guest.adults}</td>
                    <td className="px-4 py-3 tabular">
                      {guest.children}
                      {guest.children_names ? (
                        <span className="mt-1 block text-xs text-ink-muted">
                          {guest.children_names}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {guest.email ?? "—"}
                      {guest.phone ? <span className="block">{guest.phone}</span> : null}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-ink-soft">{guest.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Mensagens */}
      <section>
        <h2 className="mb-4 text-2xl">Mensagens</h2>

        {messages.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhuma mensagem ainda.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {messages.map((message) => (
              <li key={message.id} className="surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-green-800">{message.guest_name}</p>
                  <span
                    className={
                      message.approved
                        ? "rounded-full bg-green-100 px-2.5 py-1 text-[0.65rem] uppercase tracking-widest text-green-700"
                        : "rounded-full bg-bordo-100 px-2.5 py-1 text-[0.65rem] uppercase tracking-widest text-bordo-600"
                    }
                  >
                    {message.approved ? "Aprovada" : "Pendente"}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {message.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
