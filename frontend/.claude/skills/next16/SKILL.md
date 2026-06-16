---
description: Regras do Next.js 16 MODIFICADO deste projeto — sempre consulte node_modules/next/dist/docs antes de usar APIs do Next, e nunca renderize uma tag <script> dentro de um componente no cliente. Use ao mexer em src/app, layout.tsx, next.config.ts ou qualquer API do Next.
paths: src/app/**, next.config.ts, src/middleware.ts
---

# Next.js 16 (modificado)

Veja `frontend/AGENTS.md`: **"This is NOT the Next.js you know."** A versão (16.2.9) tem mudanças que podem divergir do seu conhecimento de treino.

## Regra 1 — leia os docs empacotados antes de usar APIs do Next

Os guias oficiais desta versão estão em `node_modules/next/dist/docs/` (estrutura: `01-app/`, `02-pages/`, `03-architecture/`). Antes de usar/alterar metadata, layouts, route handlers, server actions, caching, `next.config`, etc., **leia o guia correspondente lá** — não confie na memória.

```bash
grep -rli "<assunto>" node_modules/next/dist/docs/ | head
```

## Regra 2 — nada de `<script>` cru renderizado no cliente

Este Next/React lança erro de console quando um componente renderiza uma tag `<script>` no cliente ("Scripts inside React components are never executed when rendering on the client").

Padrão correto (doc: `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`): um helper que usa `type="text/javascript"` no servidor e `type="text/plain"` no cliente, com `suppressHydrationWarning`. O `typeof window` precisa ser avaliado **dentro de um componente cliente** (não no layout server), senão o valor é serializado na SSR e não alterna.

Exemplo vivo no repo: `src/components/theme-provider.tsx` aplica isso via `scriptProps` do `next-themes`. Reutilize esse padrão para qualquer script anti-flash (tema, locale, estado persistido).

## Lembretes

- Dev/start na porta **3002** (`next dev -p 3002`).
- Tailwind v4 sem `tailwind.config` (tokens em `src/app/globals.css`).
