-- ---------------------------------------------------------------------------
-- 0003_gift_payments.sql
--
-- "Presentes comprados": o próprio convidado avisa que pagou, opcionalmente
-- anexando o comprovante. Serve para o casal cruzar com o extrato, já que
-- links de pagamento reutilizáveis e PIX não dizem quem pagou o quê.
--
-- Aplicar da mesma forma que as anteriores (SQL Editor ou `supabase db push`).
-- ---------------------------------------------------------------------------

create table if not exists public.gift_payments (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  /** id do presente em config/gifts.ts. Null = contribuição de valor livre. */
  gift_id      text,
  /** Título gravado no momento do aviso, para o histórico não mudar se a
      lista de presentes for editada depois. */
  gift_title   text,
  amount       numeric(10, 2) not null default 0 check (amount >= 0),

  /** Null quando o convidado escolheu ficar anônimo. */
  payer_name   text check (payer_name is null or char_length(payer_name) <= 120),
  anonymous    boolean not null default false,

  method       text not null default 'link' check (method in ('link', 'pix', 'outro')),
  message      text check (message is null or char_length(message) <= 600),

  /** Caminho do arquivo no bucket `comprovantes`. */
  receipt_path text,

  /** O casal conferiu no extrato. */
  confirmed    boolean not null default false,

  -- Anônimo sem nome, ou identificado com nome: não os dois estados quebrados.
  constraint gift_payments_identidade check (anonymous or payer_name is not null)
);

comment on table public.gift_payments is
  'Avisos de pagamento de presentes enviados pelos próprios convidados.';

create index if not exists gift_payments_created_at_idx
  on public.gift_payments (created_at desc);
create index if not exists gift_payments_gift_idx
  on public.gift_payments (gift_id);
create index if not exists gift_payments_confirmed_idx
  on public.gift_payments (confirmed);

-- ---------------------------------------------------------------------------
-- RLS: nenhum acesso público.
--
-- A escrita acontece em /api/gift-payments com a service role (validação,
-- sanitização e rate limiting no servidor). A leitura é só do painel do casal.
-- Ninguém consegue listar quem deu presente, nem baixar comprovante de outra
-- pessoa, usando a chave anônima.
-- ---------------------------------------------------------------------------
alter table public.gift_payments enable row level security;

-- (Sem policy = nada liberado para anon/authenticated. A service role passa.)

-- ---------------------------------------------------------------------------
-- Storage dos comprovantes — bucket PRIVADO.
--
-- O painel abre cada arquivo por URL assinada e temporária; o bucket não é
-- público, então o link não vaza se alguém descobrir o caminho do arquivo.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprovantes',
  'comprovantes',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
