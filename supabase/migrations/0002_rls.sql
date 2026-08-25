-- ---------------------------------------------------------------------------
-- 0002_rls.sql — Row Level Security
--
-- PRINCÍPIO: o site é público, o banco NÃO é.
--
-- Todas as escritas (RSVP, mensagens, pagamentos) passam pelos Route Handlers
-- do Next.js usando a SERVICE ROLE KEY, que fica só no servidor. A service role
-- ignora RLS por natureza — por isso o visitante anônimo não precisa (e não
-- deve) ter permissão de escrita direta na API do Supabase.
--
-- Vantagem: rate limiting, honeypot, validação e sanitização acontecem sempre.
-- Ninguém consegue inundar a tabela chamando a API do Supabase direto.
-- ---------------------------------------------------------------------------

alter table public.guests         enable row level security;
alter table public.guest_messages enable row level security;
alter table public.gifts          enable row level security;
alter table public.payments       enable row level security;

-- Garante estado limpo se a migration for reaplicada
drop policy if exists "guests: sem acesso publico"           on public.guests;
drop policy if exists "mensagens: leitura das aprovadas"     on public.guest_messages;
drop policy if exists "presentes: leitura dos ativos"        on public.gifts;

-- ---------------------------------------------------------------------------
-- guests — nenhum acesso público.
-- O visitante NÃO pode listar convidados, nem editar o RSVP de outra pessoa.
-- ---------------------------------------------------------------------------
-- (Sem policy = nada permitido para anon/authenticated. A service role passa.)

-- ---------------------------------------------------------------------------
-- guest_messages — leitura pública somente das mensagens aprovadas.
-- Permite montar um mural no site sem expor o que ainda não foi moderado.
-- ---------------------------------------------------------------------------
create policy "mensagens: leitura das aprovadas"
  on public.guest_messages
  for select
  to anon, authenticated
  using (approved = true);

-- ---------------------------------------------------------------------------
-- gifts — leitura pública somente dos presentes ativos.
-- Escrita apenas pela service role (ou pelo Dashboard).
-- ---------------------------------------------------------------------------
create policy "presentes: leitura dos ativos"
  on public.gifts
  for select
  to anon, authenticated
  using (active = true);

-- ---------------------------------------------------------------------------
-- payments — nenhum acesso público, em nenhuma operação.
-- ---------------------------------------------------------------------------
-- (Sem policy.)

-- ---------------------------------------------------------------------------
-- ALTERNATIVA (não recomendada)
-- Se algum dia você quiser gravar RSVP/mensagens direto do navegador com a
-- chave anônima, descomente abaixo. Você perde o rate limiting do servidor.
-- ---------------------------------------------------------------------------
-- create policy "guests: envio publico de rsvp"
--   on public.guests for insert to anon with check (true);
--
-- create policy "mensagens: envio publico"
--   on public.guest_messages for insert to anon
--   with check (approved = false);
