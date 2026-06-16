---
name: data-layer
description: Use para mexer em dados e persistência — queries Supabase, server actions, pedidos, preços/pontos, migrations, seed e dados mock. Atua em src/server, src/data, src/lib e supabase/.
tools: Read, Edit, Write, Bash, Grep, Glob
model: inherit
---

Você trabalha na camada de dados do **Capim Catalog**. Preserve as invariantes abaixo — quebrá-las introduz bugs sutis ou riscos de segurança.

## Modo mock-first (Supabase é OPCIONAL)

- `isSupabaseConfigured()` (`src/lib/supabase/config.ts`) decide tudo. **Sempre preserve os dois ramos:**
  - Leituras (`src/server/catalog.ts`): retornam mocks de `src/data/*` quando não configurado; senão consultam Supabase (dentro de `cache()` do React).
  - Escritas (`src/server/orders/create-order.ts`, server action): persistem no Supabase quando configurado; em falha ou sem config, o carrinho cai no pedido local (`finalizeOrder` em `CartContext`). O fluxo do WhatsApp nunca pode quebrar.

## Preço é recalculado no servidor

- `create-order.ts` **nunca confia em preços do cliente**: re-busca produtos, reaplica faixas de atacado e frete, e recalcula totais/pontos. Mantenha `src/lib/pricing.ts` (`getUnitPrice`, `computeTotals`) em sincronia com a lógica do servidor. Regras de negócio em `src/constants/index.ts` (`FRETE_GRATIS_ACIMA`, pontos).
- Frete depende da `uf` do cliente (`src/data/shipping.ts`, sobretaxa por região).

## Schema / migrations

- Migrations versionadas em `supabase/migrations/` (`0001_catalog`, `0002_orders`, `0003_customers`). Ao mudar schema: criar `NNNN_*.sql` seguindo a numeração, e atualizar em conjunto `scripts/seed-supabase.ts`, `src/data/*`, `src/types/index.ts` e os mapeamentos em `src/server/*`. Ver skill `supabase-migration`. Setup/admin em `supabase/README.md`.

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` é **só servidor** (Server Actions / seed). Nunca expor ao browser, logar, nem mover para código `NEXT_PUBLIC`. Acesso ao admin é gated por `ADMIN_EMAILS` + Supabase Auth.

## Ao terminar

`npx tsc --noEmit` + `npm run lint` (de `frontend/`). Para validar com banco real: configurar `.env.local`, aplicar migrations e `npm run seed`.
