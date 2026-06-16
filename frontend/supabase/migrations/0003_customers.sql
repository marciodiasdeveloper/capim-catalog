-- Clientes (sem login). Rode após 0001 e 0002.

create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  cpf         text not null unique,
  name        text not null,
  phone       text,
  rua         text,
  numero      text,
  bairro      text,
  complemento text,
  cidade      text,
  uf          text,
  cep         text,
  observacao  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists customers_cpf_idx on public.customers (cpf);

-- updated_at automático (reusa a função criada em 0001_catalog.sql)
drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- Vínculo pedido → cliente (mantém o pedido se o cliente for excluído).
alter table public.orders
  add column if not exists customer_id uuid references public.customers (id) on delete set null;

create index if not exists orders_customer_id_idx on public.orders (customer_id);

-- RLS: clientes são privados. Sem policies => só Server Actions via service_role.
alter table public.customers enable row level security;
