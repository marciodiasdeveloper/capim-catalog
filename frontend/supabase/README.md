# Supabase — setup do catálogo

O app funciona **sem banco** (usa os mocks em `src/data`). Para ligar a
persistência no Supabase, siga os passos abaixo. Enquanto as variáveis não
existirem, o repositório (`src/server/catalog.ts`) continua caindo no mock.

## 1. Criar o projeto

1. Crie um projeto em <https://supabase.com>.
2. Em **Project Settings → API**, copie:
   - `Project URL`
   - `anon public` key
   - `service_role` key (secreta)

## 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> `.env.local` já está no `.gitignore`. Nunca commite a `service_role`.

## 3. Criar as tabelas (schema + RLS)

No painel do Supabase, abra **SQL Editor** e rode, na ordem:
1. `supabase/migrations/0001_catalog.sql` — `categories` e `products`.
2. `supabase/migrations/0002_orders.sql` — `orders` e `order_items`.
3. `supabase/migrations/0003_customers.sql` — `customers` + `orders.customer_id`.

(ou, com a CLI do Supabase: `supabase db push`.)

`categories`/`products` têm **RLS** de leitura pública; `orders`/`order_items`
são privados (sem policy) — só Server Actions via service_role acessam.

## 4. Popular com os dados atuais (seed)

```bash
npm run seed
```

O script lê os mocks de `src/data` e faz `upsert` em `categories` e `products`.

## 5. Pronto

Reinicie o `npm run dev`. Agora o catálogo é servido do Supabase. Para voltar
ao mock, basta remover as variáveis do Supabase do `.env.local`.

## 6. Admin (`/admin`)

O painel administrativo (CRUD de produtos e categorias) fica em `/admin`.

1. **Crie o usuário admin** no Supabase: **Authentication → Users → Add user**
   (e-mail + senha). Confirme o e-mail se necessário.
2. **Autorize o e-mail**: adicione-o em `ADMIN_EMAILS` no `.env.local`
   (vários separados por vírgula). Sem isso, o login é recusado mesmo com senha
   correta.
3. Acesse `/admin/login`, entre, e gerencie o catálogo.

### Segurança

- **Nenhuma policy de escrita** no banco: anon/authenticated só leem. Toda
  escrita passa por **Server Actions** que (a) exigem admin logado, (b) validam
  com `zod` e (c) usam a `service_role` (que ignora RLS) — no servidor.
- O `service_role` e o `ADMIN_EMAILS` ficam só no servidor; nunca vão ao browser.

## Pedidos e ranking do mês

- Ao **Finalizar pedido**, quando o Supabase está configurado, o checkout chama
  a Server Action `createOrder`, que **recalcula todo o preço/frete/total no
  servidor** a partir do catálogo do banco (não confia no carrinho do cliente),
  grava em `orders`/`order_items` e calcula os pontos. Sem Supabase, o pedido é
  montado localmente (fluxo de WhatsApp continua funcionando).
- O **ranking do mês** (`/ranking` e a faixa no topo do catálogo) é agregado a
  partir dos pedidos **pagos** do mês corrente, agrupados por CPF — retornando
  só dados seguros (nome, cidade, pontos, pedidos). Sem Supabase, usa o mock.
- Pontos por pedido: `floor(total) × 1 + 50` (configurável em `src/constants`).
- **Gestão de pedidos**: em `/admin/pedidos` o admin marca cada pedido como
  pago/cancelado/pendente. Só os **pagos** contam no ranking.
- **"Você" no ranking**: o CPF é salvo localmente ao finalizar; a faixa do topo
  consulta só a posição do próprio cliente (sem expor o ranking com CPFs).
- **Sessão do admin**: `src/proxy.ts` renova a sessão do Supabase nas rotas
  `/admin` (refresh de token entre navegações).

## Clientes (sem login)

- A cada pedido, a action `createOrder` faz **upsert** do cliente em `customers`
  (chave = CPF) e grava `orders.customer_id` (mantendo também o snapshot dos
  dados no pedido, para histórico). `customers` é privado (RLS sem policies).
- O **ranking** passa a agrupar por `customer_id` (nome/cidade canônicos do
  cliente). O "você" continua resolvido pelo CPF salvo localmente.
- Admin de clientes:
  - `/admin/clientes` — lista + busca (nome/CPF), nº de pedidos e total gasto.
  - `/admin/clientes/[id]` — ficha + histórico de pedidos; editar/excluir.
- Admin de pedidos:
  - `/admin/pedidos` — filtro por status e "este mês"; nº abre o detalhe.
  - `/admin/pedidos/[id]` — itens, endereço, cliente vinculado, valores e status.

## Como o código consome

- `src/lib/supabase/server.ts` — cliente de leitura (anon) + `isSupabaseConfigured()`.
- `src/server/catalog.ts` — `getCategories` / `getProducts` / `getProductsById`
  (com `cache()` por requisição e fallback para o mock).
- O `app/layout.tsx` e o `app/page.tsx` buscam no servidor e passam os dados via
  props para os componentes cliente (carrinho e catálogo).
