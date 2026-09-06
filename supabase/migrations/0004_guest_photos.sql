-- ---------------------------------------------------------------------------
-- 0004_guest_photos.sql
--
-- O álbum coletivo do casamento: no dia da festa a página /galeria libera um
-- botão para os convidados enviarem as fotos que tiraram, e elas passam a
-- aparecer na mesma galeria das fotos do casal.
--
-- Aplicar como as anteriores (SQL Editor do Supabase ou `supabase db push`).
-- Sem esta migration aplicada, o envio responde erro e a galeria continua
-- mostrando apenas as fotos de `config/wedding.ts`.
-- ---------------------------------------------------------------------------

create table if not exists public.guest_photos (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  /** Caminho do arquivo no bucket `fotos-convidados`. Único: o mesmo arquivo
      não pode ser registrado duas vezes. */
  storage_path text not null unique,

  /** Null quando o convidado preferiu não se identificar. */
  guest_name   text check (guest_name is null or char_length(guest_name) <= 80),
  caption      text check (caption is null or char_length(caption) <= 140),

  /** Visível na galeria pública.
      O padrão vem de `weddingConfig.guestPhotos.requireApproval`: a rota de
      envio grava o valor explicitamente, então o default aqui só vale para
      inserções feitas à mão pelo Dashboard. */
  approved     boolean not null default true,

  /** Dimensões e peso do arquivo já reduzido — ajudam a diagnosticar problemas
      de upload sem precisar baixar a imagem. */
  width        integer check (width is null or width > 0),
  height       integer check (height is null or height > 0),
  byte_size    integer check (byte_size is null or byte_size >= 0),
  mime_type    text
);

comment on table public.guest_photos is
  'Fotos enviadas pelos próprios convidados durante o casamento.';

-- A galeria lista as aprovadas em ordem de chegada (as mais novas primeiro).
create index if not exists guest_photos_created_at_idx
  on public.guest_photos (created_at desc);
create index if not exists guest_photos_approved_idx
  on public.guest_photos (approved);

-- ---------------------------------------------------------------------------
-- RLS — leitura pública apenas das fotos aprovadas.
--
-- Mesma lógica de `guest_messages` (migration 0002): a galeria é uma página
-- pública, então a leitura das fotos liberadas pode acontecer com a chave
-- anônima. O que ainda não foi aprovado, ou o que o casal escondeu, não sai
-- daqui — e a escrita continua exclusiva da service role, em
-- /api/guest-photos, onde ficam o rate limiting, a validação e o controle de
-- data (só dá para enviar dentro da janela configurada).
-- ---------------------------------------------------------------------------
alter table public.guest_photos enable row level security;

drop policy if exists "fotos: leitura das aprovadas" on public.guest_photos;

create policy "fotos: leitura das aprovadas"
  on public.guest_photos
  for select
  to anon, authenticated
  using (approved = true);

-- ---------------------------------------------------------------------------
-- Storage — bucket PÚBLICO.
--
-- Diferente de `comprovantes` (privado, aberto por URL assinada): estas fotos
-- são exibidas numa página aberta e precisam de URL estável e cacheável. URL
-- assinada expiraria em minutos e derrubaria as imagens da galeria.
--
-- O limite de 4 MB acompanha `MAX_PHOTO_BYTES` em
-- lib/validations/guest-photo.ts. O navegador já reduz cada foto antes de
-- enviar, então na prática os arquivos chegam com algumas centenas de KB.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-convidados',
  'fotos-convidados',
  true,
  4194304, -- 4 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura liberada, escrita não: quem envia é a service role pela nossa API.
-- (Sem policy de insert/update/delete para anon, o bucket público continua
--  somente-leitura para o visitante.)
drop policy if exists "fotos-convidados: leitura publica" on storage.objects;

create policy "fotos-convidados: leitura publica"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'fotos-convidados');
