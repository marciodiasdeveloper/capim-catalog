-- Pedidos e itens de pedido (alimentam o ranking do mês).
-- Rode após 0001_catalog.sql.

create sequence if not exists public.order_number_seq start 1281;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  number         bigint not null default nextval('public.order_number_seq') unique,
  customer_name  text not null,
  customer_cpf   text not null,
  customer_phone text,
  rua            text,
  numero         text,
  bairro         text,
  complemento    text,
  cidade         text,
  uf             text,
  cep            text,
  observacao     text,
  delivery_label text,
  delivery_price numeric(10, 2) not null default 0,
  subtotal       numeric(10, 2) not null default 0,
  frete          numeric(10, 2) not null default 0,
  total          numeric(10, 2) not null default 0,
  points         int  not null default 0,
  status         text not null default 'pending'
                   check (status in ('pending', 'paid', 'cancelled')),
  created_at     timestamptz not null default now()
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   text not null,
  name         text not null,
  qty          int  not null,
  unit_price   numeric(10, 2) not null,
  line_total   numeric(10, 2) not null,
  is_wholesale boolean not null default false
);

create index if not exists orders_created_at_idx on public.orders (created_at);
create index if not exists orders_cpf_idx on public.orders (customer_cpf);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- RLS: pedidos são privados. Sem policies => nenhum cliente acessa.
-- Toda leitura/escrita ocorre em Server Actions via service_role (ignora RLS).
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
