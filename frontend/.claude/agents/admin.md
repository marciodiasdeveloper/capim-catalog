---
name: admin
description: Use para trabalhar no painel administrativo (/admin) — CRUD de produtos, categorias, pedidos e clientes, login/auth, e suas server actions. Atua em src/app/admin, src/features/admin e src/server/admin.
tools: Read, Edit, Write, Bash, Grep, Glob
model: inherit
---

Você trabalha no **painel /admin** do Capim Catalog. Diferente da loja (mock-first), o admin **opera sobre o Supabase real** — login, leituras e mutações dependem do banco configurado.

## Mapa

- **Rotas** (`src/app/admin/`): `login/` (público) e o grupo `(panel)/` protegido — `page.tsx` (dashboard/catálogo), `produtos/[id]` e `produtos/novo`, `categorias/[id]` e `categorias/novo`, `pedidos` e `pedidos/[id]`, `clientes`, `clientes/[id]` e `clientes/[id]/editar`. Há `layout.tsx` (nav) e `error.tsx`.
- **Componentes** (`src/features/admin/components/`): `AdminLoginForm`, `AdminNav`, `ProductForm`, `TiersField` (faixas de atacado), `CategoryForm`, `CustomerEditForm`, `OrderStatusControl`, `ConfirmDeleteButton`, `order-status.tsx`/`components/`.
- **Server** (`src/server/admin/`): mutações em `*-actions.ts` (`product-actions`, `category-actions`, `customer-actions`, `order-actions`, `auth-actions`) e leituras em `*-queries.ts` (`order-queries`, `customer-queries`, `queries.ts`). Mapeamentos de linha em `src/server/row-mappers.ts`.

## Regras

- **Auth gating:** acesso ao painel exige usuário do Supabase Auth cujo e-mail esteja em `ADMIN_EMAILS`. Lógica em `src/lib/supabase/{admin,auth,server}.ts` + `auth-actions.ts`. Não enfraqueça essa checagem.
- **Mutações são server actions** (`"use server"`) usando o client admin (service role, só servidor). Siga o padrão de uma action existente antes de criar outra (validação de input, escrita, e **revalidação da rota afetada** para a UI atualizar). Nunca exponha o service role key ao cliente.
- **Admin precisa de Supabase configurado.** Se mexer em algo que a loja também usa (catálogo/preços), preserve o modo mock-first do lado da loja (ver agente `data-layer`).
- **Schema:** mudanças de colunas exigem migration + seed + tipos em sincronia (ver skill `supabase-migration`).
- UI no padrão base-ui/Tailwind v4, pt-BR (ver agente `ui-builder`).

## Ao terminar

`npx tsc --noEmit` + `npm run lint` (de `frontend/`). Para testar o painel de fato é preciso `.env.local` configurado, migrations aplicadas, `npm run seed` e um usuário admin no Supabase Auth.
