-- Catálogo: categorias e produtos
-- Rode no SQL editor do Supabase ou via `supabase db push`.

create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  accent      text not null default '#3b82f6',
  icon        text not null default 'pill',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id          text primary key,
  category_id text not null references public.categories (id) on delete restrict,
  name        text not null,
  description text not null default '',
  price       numeric(10, 2) not null check (price >= 0),
  tiers       jsonb,
  unit        text not null default 'un',
  min_qty     int  not null default 1 check (min_qty >= 1),
  image       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.categories enable row level security;
alter table public.products  enable row level security;

-- Leitura pública (catálogo aberto)
create policy "Public read categories"
  on public.categories for select using (true);
create policy "Public read products"
  on public.products for select using (true);

-- Sem policy de escrita: nenhum cliente (anon/authenticated) escreve via API.
-- Toda escrita acontece em Server Actions usando a service_role key (que
-- ignora RLS), após checagem de admin no servidor. É a opção mais segura.
