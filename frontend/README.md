# Capim Catalog — app (frontend)

Aplicação **Next.js 16** do Capim Catalog: catálogo de atacado, monte o pedido e
finalize pelo WhatsApp, com ranking de gamificação e painel administrativo.
Toda a aplicação vive nesta pasta (`frontend/`).

> Documentação completa do projeto: **[`../README.md`](../README.md)**
> (visão geral, arquitetura, regras de negócio, schema). Guia para contribuir/IA:
> **[`CLAUDE.md`](./CLAUDE.md)** e **[`AGENTS.md`](./AGENTS.md)**. Banco:
> **[`supabase/README.md`](./supabase/README.md)**.

## Rodando

> 🌐 **Demo ao vivo:** <https://capim-catalog.vercel.app/>

Pré-requisito: **pnpm** (o projeto usa `pnpm-lock.yaml` — não use npm/npx).

```bash
pnpm install
pnpm dev      # http://localhost:3002   (porta 3002, NÃO 3000)
```

O app roda **mock-first**: sem Supabase configurado, o catálogo funciona com os
dados de `src/data/*`. Pedido persistido, ranking e `/admin` exigem Supabase —
copie `.env.local.example` → `.env.local` e siga `supabase/README.md`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento (porta 3002) |
| `pnpm build` / `pnpm start` | Build de produção / servir |
| `pnpm lint` | ESLint (flat config) |
| `pnpm exec tsc --noEmit` | Checagem de tipos |
| `pnpm test` | Testes unitários/integração (Vitest) |
| `pnpm test:watch` | Vitest em watch |
| `pnpm test:cov` | Testes com cobertura |
| `pnpm test:e2e` | Testes end-to-end (Playwright, em `e2e/`) |
| `pnpm seed` | Popula o Supabase a partir dos mocks |

## Stack

Next.js 16 (App Router, **fork modificado** — ver `AGENTS.md`), React 19,
TypeScript estrito, Tailwind v4 (tokens em `src/app/globals.css`, sem config),
componentes **base-ui** (estilo shadcn em `src/components/ui`), Supabase
(opcional), next-themes, sonner, lucide. Testes: **Vitest** (unitário/integração)
+ **Playwright** (e2e). A camada Supabase é tipada via generic `<Database>`
(`src/types/supabase.ts`).

## Estrutura (resumo)

```
src/
  app/         rotas (site + admin)
  screens/     telas que compõem features
  features/    cart, catalog, gamification, order, admin
  server/      leituras/ações Supabase (mock-first)
  lib/         pricing, format, validation, cep, whatsapp (lógica pura, testada)
  data/        catálogo/entrega/empresa mock
  components/  ui (base-ui) + layout
  constants/   regras de negócio (frete grátis, pontos, UFs)
  types/       tipos de domínio
```

`src/lib/pricing.ts` é a **fonte única** de cálculo: `getUnitPrice`, `computeTotals`,
`resolveFreight`, `computePoints`, `toOrderItem` e `computeOrder` — usados igualmente
pelo carrinho (cliente) e pela server action (`create-order`), garantindo paridade.

## Limitações conhecidas

- **Rate limit** da `create-order` é em memória (por instância); para um teto global
  use um store compartilhado (Redis/Upstash).
- **Tipos do Supabase**: os clientes ainda não usam o generic `<Database>` — gere com
  `supabase gen types typescript` quando conectar o projeto.
- **CSP**: há headers de segurança (`next.config.ts`), mas ainda não uma Content-Security-Policy
  com nonce (requer QA no navegador antes de habilitar em modo enforce).
- **Contraste de cor (a11y)**: auditado com axe (`pnpm test:e2e`); estrutura/ARIA/nomes passam
  com zero violações. Resta afinar o contraste de alguns tokens de marca (`--primary` usado como
  fundo e como texto; accents de categoria) — decisão de design (idealmente tokens separados
  para fundo vs. texto).
