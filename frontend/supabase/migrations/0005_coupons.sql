-- Cupons de desconto. Rode após 0004.

create table if not exists public.coupons (
  id             text primary key,
  code           text not null unique,
  description    text not null default '',
  discount_type  text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  min_items      int  not null default 0 check (min_items >= 0),
  min_subtotal   numeric(10, 2) not null default 0 check (min_subtotal >= 0),
  max_discount   numeric(10, 2) check (max_discount is null or max_discount > 0),
  active         boolean not null default true,
  max_uses       int check (max_uses is null or max_uses > 0),
  current_uses   int  not null default 0,
  expires_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- RLS: leitura pública só de cupons ATIVOS; escrita só via service_role (Server Actions).
alter table public.coupons enable row level security;

create policy "Public read active coupons"
  on public.coupons for select using (active = true);

-- Snapshot do cupom/desconto aplicado no pedido.
alter table public.orders
  add column if not exists discount numeric(10, 2) not null default 0;
alter table public.orders
  add column if not exists coupon_code text;
