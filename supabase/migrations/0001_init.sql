-- ---------------------------------------------------------------------------
-- 0001_init.sql — estrutura inicial do banco
--
-- Como aplicar:
--   Opção A (Dashboard): Supabase → SQL Editor → cole este arquivo → Run
--   Opção B (CLI):       npx supabase db push
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- guests — confirmações de presença (RSVP)
-- ---------------------------------------------------------------------------
create table if not exists public.guests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text        not null check (char_length(trim(name)) between 3 and 120),
  email          text        check (email is null or char_length(email) <= 160),
  phone          text        check (phone is null or char_length(phone) <= 20),
  attending      boolean     not null,
  adults         smallint    not null default 0 check (adults between 0 and 20),
  children       smallint    not null default 0 check (children between 0 and 20),
  companions     text        check (companions is null or char_length(companions) <= 500),
  children_names text        check (children_names is null or char_length(children_names) <= 500),
  notes          text        check (notes is null or char_length(notes) <= 1000)
);

comment on table public.guests is 'Confirmações de presença enviadas pelo site.';

create index if not exists guests_created_at_idx on public.guests (created_at desc);
create index if not exists guests_attending_idx  on public.guests (attending);

-- ---------------------------------------------------------------------------
-- guest_messages — mural de recados (com moderação)
-- ---------------------------------------------------------------------------
create table if not exists public.guest_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text        not null check (char_length(trim(guest_name)) between 2 and 80),
  message    text        not null check (char_length(trim(message)) between 5 and 600),
  approved   boolean     not null default false
);

comment on column public.guest_messages.approved is
  'Mensagens só aparecem no site depois de aprovadas manualmente.';

create index if not exists guest_messages_approved_idx
  on public.guest_messages (approved, created_at desc);

-- ---------------------------------------------------------------------------
-- gifts — opcional. A lista vive em config/gifts.ts na primeira versão.
-- Crie aqui apenas se quiser gerenciar presentes pelo banco no futuro.
-- ---------------------------------------------------------------------------
create table if not exists public.gifts (
  id          text primary key,
  created_at  timestamptz not null default now(),
  title       text        not null,
  description text        not null default '',
  value       numeric(10, 2) not null check (value >= 0),
  image       text,
  payment_url text,
  active      boolean     not null default true,
  featured    boolean     not null default false,
  sort_order  integer     not null default 0
);

create index if not exists gifts_active_idx on public.gifts (active, sort_order);

-- ---------------------------------------------------------------------------
-- payments — só é usada se a integração oficial do Mercado Pago for ativada.
-- Nunca armazena dados de cartão (número, CVV, validade).
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  gift_id             text,
  external_payment_id text unique,
  payer_name          text,
  amount              numeric(10, 2) not null default 0 check (amount >= 0),
  status              text        not null default 'pending',
  payment_method      text
);

comment on table public.payments is
  'Registro dos pagamentos recebidos via webhook do Mercado Pago. Sem dados de cartão.';

create index if not exists payments_status_idx     on public.payments (status);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

-- Mantém `updated_at` sempre atualizado
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_set_updated_at on public.payments;

create trigger payments_set_updated_at
  before update on public.payments
  for each row
  execute function public.set_updated_at();
