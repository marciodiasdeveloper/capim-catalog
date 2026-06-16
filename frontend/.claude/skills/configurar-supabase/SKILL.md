---
description: Configura o Supabase do Capim Catalog — variáveis de ambiente, migrations, seed e usuário admin. Use ao ligar o banco real (sair do modo mock) ou quando pedidos/ranking/admin não funcionarem.
allowed-tools: Bash(npm run seed:*) Read
---

# Configurar Supabase

O app roda **mock-first**: sem Supabase, o catálogo funciona com dados de `src/data/*`, mas **pedido persistido, ranking e `/admin` exigem o banco**. `isSupabaseConfigured()` (`src/lib/supabase/config.ts`) detecta isso pelas vars `NEXT_PUBLIC_SUPABASE_*`.

## Passos

1. **Env:** copie `frontend/.env.local.example` → `frontend/.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas)
   - `SUPABASE_SERVICE_ROLE_KEY` (**só servidor** — nunca commitar/expor)
   - `ADMIN_EMAILS` (e-mails com acesso ao `/admin`, separados por vírgula)
   > `.env.local` é ignorado pelo git. Não exiba o conteúdo das chaves em logs.
2. **Schema:** aplique as migrations de `frontend/supabase/migrations/` (`0001_catalog`, `0002_orders`, `0003_customers`) no projeto Supabase (SQL editor ou CLI). Detalhes em `frontend/supabase/README.md`.
3. **Seed:** de `frontend/`, rode `npm run seed` (popula a partir dos mocks via `scripts/seed-supabase.ts`).
4. **Usuário admin:** crie o usuário em Supabase → Auth → Users com um e-mail que esteja em `ADMIN_EMAILS` (sem isso ninguém entra no `/admin`).
5. **Reinicie o dev server** (`npm run dev`) para reler o `.env.local`.

## Validar

`curl :3002/admin/login` deve carregar; finalizar um pedido deve persistir (em vez do fallback local). Para mudanças de schema, use a skill `supabase-migration`.
