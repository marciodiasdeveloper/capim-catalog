-- Eventos de analytics (tráfego + comportamento). Rode após 0006.
--
-- Anônimo/LGPD-friendly: SEM PII. `session_id` é um id aleatório do navegador
-- (não vinculado a cliente/CPF). Tabela append-only (eventos imutáveis): sem
-- `updated_at`/trigger. Escrita SÓ via service_role (endpoint /api/track) —
-- mesma postura de `orders`: RLS habilitado e nenhuma policy de insert/select.

create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null
                check (type in ('page_view', 'product_view', 'add_to_cart', 'begin_checkout')),
  session_id  text not null,                 -- id anônimo do navegador (localStorage)
  product_id  text,                          -- product_view / add_to_cart (sem FK, igual a order_items)
  path        text,                          -- rota do page_view (ex.: '/', '/ranking')
  qty         int,                           -- quantidade adicionada em add_to_cart
  uf          text,                          -- UF do cliente, se já informada
  referrer    text,                          -- só o host do document.referrer (sem query)
  user_agent  text,                          -- truncado no servidor
  created_at  timestamptz not null default now()
);

-- Janelas por tipo (visitas hoje/mês, funil, tendência).
create index if not exists analytics_events_type_created_idx
  on public.analytics_events (type, created_at);
-- Agregação por produto (mais adicionados ao carrinho).
create index if not exists analytics_events_product_idx
  on public.analytics_events (product_id) where product_id is not null;
-- Sessões distintas por janela (visitantes únicos).
create index if not exists analytics_events_session_created_idx
  on public.analytics_events (session_id, created_at);

-- RLS: igual a `orders` — habilita e NÃO cria policy. anon/authenticated não
-- leem nem escrevem; só o service_role (que ignora RLS) via /api/track.
alter table public.analytics_events enable row level security;
