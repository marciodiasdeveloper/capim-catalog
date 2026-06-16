---
description: Cria uma nova migration Supabase e mantém seed, tipos e mapeamentos em sincronia. Use ao alterar o schema do banco (tabelas/colunas) do Capim Catalog.
allowed-tools: Bash(npm run seed:*) Read Write Edit
---

# Migration do Supabase

Schema versionado em `frontend/supabase/migrations/`. Hoje: `0001_catalog.sql`, `0002_orders.sql`, `0003_customers.sql`. Setup/instruções em `frontend/supabase/README.md`.

## Passos

1. **Criar a migration:** novo arquivo `NNNN_<descricao>.sql` em `supabase/migrations/`, seguindo a numeração sequencial (próximo é `0004_...`). SQL idempotente quando fizer sentido (`if not exists`).
2. **Sincronizar a aplicação** — mudança de schema quase sempre exige atualizar, juntos:
   - `src/types/index.ts` (tipos de domínio e/ou os `*Row` de banco)
   - mapeamentos em `src/server/*` (ex.: `mapProduct`/`mapCategory` em `catalog.ts`, inserts em `orders/create-order.ts`)
   - dados mock em `src/data/*` (o app roda mock-first; mocks precisam refletir o novo shape)
   - `scripts/seed-supabase.ts` (colunas inseridas no seed)
3. **Aplicar** a migration no projeto Supabase (SQL editor ou CLI, conforme o `supabase/README.md`).
4. **Seed:** com `.env.local` configurado, rode `npm run seed` (de `frontend/`).

## Invariantes

- Preserve o modo mock-first: o app deve continuar funcionando sem Supabase (ver `isSupabaseConfigured()`).
- O servidor recalcula preços — se a mudança toca preço/frete/pontos, alinhe `src/lib/pricing.ts`, `src/constants` e `src/server/orders/create-order.ts`.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY`.

Ao final: `npx tsc --noEmit` + `npm run lint`.
