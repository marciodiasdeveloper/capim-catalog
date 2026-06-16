# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> ⚠️ **Read `AGENTS.md` first (imported above).** This is a modified **Next.js 16.2.9** — APIs and conventions may differ from upstream. Before using any Next.js API, read the relevant guide under `node_modules/next/dist/docs/`. Known gotcha: rendering a `<script>` inside a component on the client throws a console error; use the `type="text/javascript"` (server) / `type="text/plain"` (client) + `suppressHydrationWarning` swap documented in `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` (this is why `src/components/theme-provider.tsx` passes `scriptProps` to next-themes).

The entire project is the Next.js app in `frontend/` (a nested `supabase/` holds the DB schema). Run all commands from `frontend/`.

## Commands

**Package manager: pnpm only — never npm/npx.** This repo uses `pnpm-lock.yaml`. Use `pnpm install`, the scripts below, and `pnpm dlx` instead of `npx`.

```bash
pnpm dev               # dev server on http://localhost:3002 (note: NOT 3000)
pnpm build             # next build
pnpm lint              # eslint (flat config in eslint.config.mjs)
pnpm seed              # tsx scripts/seed-supabase.ts — seed Supabase from src/data mocks
pnpm test              # unit tests (Vitest) — pure logic in src/lib + cart reducer
pnpm exec tsc --noEmit # typecheck
```

Verify changes with `pnpm test` (Vitest suite covering `src/lib` pricing/format/validation/cep/whatsapp + the cart reducer), `pnpm exec tsc --noEmit`, `pnpm lint`, and manual checks against `http://localhost:3002`. A dev server is typically already running on 3002.

Path alias: `@/*` → `./src/*`.

## Big picture

### Mock-first, Supabase-optional
The app runs **fully with mock data** and degrades gracefully — Supabase is optional. `isSupabaseConfigured()` (`src/lib/supabase/config.ts`, checks `NEXT_PUBLIC_SUPABASE_*`) gates every data path:
- **Reads** (`src/server/catalog.ts`): return `src/data/*` mocks when unconfigured, else query Supabase (wrapped in React `cache()`).
- **Writes** (`src/server/orders/create-order.ts`, a server action): persist to Supabase when configured; on failure or when unconfigured, the cart falls back to a **local order** (`finalizeOrder` in `CartContext`) so the WhatsApp flow never breaks.

When touching data flows, preserve both branches (mock fallback + Supabase).

### Order pricing is recomputed server-side
`create-order.ts` never trusts client prices: it re-fetches products, re-applies wholesale tiers and shipping, and recomputes totals/points. Client-side pricing (`src/lib/pricing.ts`: `getUnitPrice`, `computeTotals`) and server pricing must stay in sync. Business rules live in `src/constants/index.ts` (`FRETE_GRATIS_ACIMA = 300`, points config).

### Cart state
`src/features/cart/CartContext.tsx` (Context + `useReducer`, consumed via `useCart`) is the single source of truth for quantities, customer data, and selected delivery. It persists the cart to `localStorage` and the last order to `sessionStorage` (keys in `src/constants`). The customer's **`uf`** drives shipping: it feeds `getDeliveryOptions`/`findDeliveryOption` (`src/data/shipping.ts`, region-based surcharge) which determine available delivery options and the free-shipping calculation — so address autofill (CEP) and the `uf` select are wired into totals.

### Checkout → WhatsApp
The order is never paid in-app. On `/confirmacao`, `src/lib/whatsapp.ts` builds a formatted order message + `wa.me` link (number from `src/data/company.ts`); the customer pays via PIX and sends the message/proof on WhatsApp. Gamification points are awarded per order (`src/constants`), surfaced via the ranking feature.

## Layout & conventions

- **Routing** (`src/app`): `(site)` group = customer storefront (`/`, `/ranking`, `/confirmacao`); `admin` group = admin panel (catalog/orders/customers CRUD), gated by Supabase Auth + the `ADMIN_EMAILS` env list. Pages are thin and delegate to `src/screens/*` and `src/features/*`.
- **Features** (`src/features/{cart,catalog,gamification,order,admin}`): each owns its components/hooks/logic. Server-only logic lives in `src/server/*` (Supabase queries + server actions).
- **UI** (`src/components/ui`): shadcn-style wrappers over **base-ui** primitives (`@base-ui/react`), **not Radix** — follow existing wrappers (e.g. `select.tsx`, `theme-toggle.tsx`'s `Menu`) when adding components. Icons: `lucide-react`. Toasts: `sonner`.
- **Styling**: Tailwind **v4** with **no `tailwind.config`** — design tokens (OKLCH), `@theme`, and `@import "tw-animate-css"` all live in `src/app/globals.css`. Prefer existing tokens (`bg-success`, `text-muted-foreground`, etc.) and `tw-animate-css` utilities (`animate-in`, `fade-in`, `slide-in-from-*`, `zoom-in`) for animation. Theme is `next-themes` (dark default).
- **Domain is pt-BR**: field names and copy are Portuguese (`nome`, `cpf`, `telefone`, `cep`, `bairro`…). Input masks live in `src/lib/format.ts`; form validation in `src/lib/validation.ts`; central types in `src/types/index.ts`. Reuse these rather than re-implementing.

## Supabase

Schema migrations are in `frontend/supabase/migrations/` (`0001_catalog`, `0002_orders`, `0003_customers`); setup/admin instructions are in `frontend/supabase/README.md`. To enable: copy `.env.local.example` → `.env.local`, fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose), and `ADMIN_EMAILS`; run the migrations, then `pnpm seed`. Admin users must also exist in Supabase Auth → Users.
