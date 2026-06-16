---
description: Adiciona um produto ou categoria ao catálogo do Capim Catalog (dados mock em src/data e/ou via painel admin quando o Supabase está ligado). Use ao cadastrar itens novos no catálogo.
---

# Novo produto / categoria

O catálogo tem duas fontes (ver `isSupabaseConfigured()`): **mocks** em `src/data/*` (modo padrão) e o **Supabase** (quando configurado). Para conteúdo aparecer em ambos, atualize o mock **e** cadastre no banco.

## Produto (mock) — `src/data/products.ts`

Acrescente um item ao array `PRODUCTS` no shape do tipo `Product` (`src/types/index.ts`):

```ts
{
  id: "kebab-unico",                 // slug único e estável
  name: "Nome — apresentação",
  categoryId: "analgesicos",         // deve existir em categories.ts
  description: "Descrição curta.",
  price: 6.9,                         // preço de varejo
  tiers: [                            // opcional: faixas de atacado (minQty crescente)
    { minQty: 5, price: 5.9 },
    { minQty: 10, price: 4.9 },
  ],
  unit: "cx",                        // "un" | "cx" | "frasco" ...
  minQty: 1,
}
```

## Categoria (mock) — `src/data/categories.ts`

Item no array `CATEGORIES` (tipo `Category`): `id`, `name`, `slug`, `accent` (hex, usado no thumb/realces) e `icon` (chave de ícone **lucide**, ex.: `"pill"`, `"thermometer"`). Confirme que a chave de ícone está mapeada na UI.

## Com Supabase ligado

Use o painel `/admin` (`ProductForm`/`CategoryForm`, com `TiersField` para atacado) ou as actions em `src/server/admin/{product,category}-actions.ts`. Para refletir nos dois mundos, mantenha mock e banco coerentes; se rodou seed, considere re-seedar (`npm run seed`).

## Ao terminar

`npx tsc --noEmit` + `npm run lint`; confira no catálogo em http://localhost:3002 (busca e filtro por categoria).
