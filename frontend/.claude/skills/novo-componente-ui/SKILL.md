---
description: Adiciona um componente de UI seguindo o padrão do projeto — wrapper shadcn-style sobre base-ui (NÃO Radix), Tailwind v4, cn/data-slot, cva para variantes, ícones lucide. Use ao criar um novo componente em src/components/ui.
---

# Novo componente de UI

O projeto usa **base-ui** (`@base-ui/react`), não Radix. Os componentes em `src/components/ui/*` são wrappers finos sobre os primitivos do base-ui, no estilo shadcn. Espelhe os existentes.

## Antes de criar

- Confira se já existe algo reaproveitável em `src/components/ui/`.
- Estude um vizinho do mesmo "tipo" como referência:
  - Primitivo com popup/portal/animação → `src/components/ui/select.tsx` (Portal/Positioner/Popup + classes `data-open:animate-in ... zoom-in-95`) e `src/components/theme-toggle.tsx` (uso de `Menu`).
  - Variantes com `cva` → `src/components/ui/button.tsx` e `badge.tsx`.
  - Wrapper simples de input → `src/components/ui/input.tsx`, `textarea.tsx`.

## Padrão

- `import { cn } from "@/lib/utils"` e combine classes com `cn(...)`, deixando `className` por último para permitir override.
- Marque o nó raiz com `data-slot="<nome>"`.
- Variantes via `class-variance-authority` (`cva`) quando houver mais de um estilo.
- Use **tokens** do Tailwind v4 (`bg-popover`, `text-muted-foreground`, `ring-foreground/10`, `bg-success`...) — definidos em `src/app/globals.css`. Nada de cores cruas.
- Ícones: `lucide-react`. Animação: utilitários do `tw-animate-css`.
- `"use client"` apenas se o componente usar estado/efeitos/handlers.

## Depois

Use o componente em algum lugar real, rode `npx tsc --noEmit` + `npm run lint` (de `frontend/`) e, se possível, confira em http://localhost:3002.
