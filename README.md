<div align="center">

# 🌿 Capim Catalog

### _Sua farmácia de bairro, agora online._

E-commerce e gestão de pedidos para uma farmácia de bairro — catálogo com preço de atacado,
checkout via **WhatsApp + PIX**, gamificação por ranking e painel administrativo completo.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-capim--catalog.vercel.app-000000?logo=vercel&logoColor=white)](https://capim-catalog.vercel.app/)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-optional-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-licença--aviso)

**🇧🇷 Português · [🇬🇧 English](README_EN.md)**

### 🔗 [Acessar a demo ao vivo →](https://capim-catalog.vercel.app/)

</div>

> [!NOTE]
> Projeto de **demonstração / portfólio**. Os dados de empresa, PIX e CNPJ
> (`12.345.678/0001-90`) em `frontend/src/data/company.ts` são **fictícios** —
> nenhum dado financeiro real está exposto.

---

## Sobre

**Capim Catalog** é a vitrine online de uma farmácia de bairro brasileira (**Capim Farma**).
O cliente navega por um catálogo de medicamentos e produtos de saúde com **preços de atacado
por faixa de quantidade**, monta o carrinho, preenche o endereço com **autopreenchimento por
CEP** e fecha o pedido — que é enviado por **WhatsApp** e pago via **PIX** (sem pagamento
dentro do app). Um sistema de **gamificação** premia clientes recorrentes com um **ranking
mensal por pontos**, e um **painel administrativo** completo cuida de produtos, categorias,
pedidos e clientes.

O projeto é **mock-first**: roda 100% sem banco de dados usando dados de exemplo, e passa a
persistir no **Supabase** assim que as variáveis de ambiente são configuradas — sem trocar
uma linha de código.

## ✨ Destaques

- 🛒 **Catálogo com atacado** — preços por faixa de quantidade calculados em tempo real.
- 💬 **Checkout via WhatsApp + PIX** — pedido formatado e enviado por `wa.me`; pagamento por PIX.
- 📍 **Endereço por CEP** — autopreenchimento de rua, bairro, cidade e UF via ViaCEP.
- 🚚 **Frete por região** — sobretaxa por região do Brasil e **frete grátis acima de R$ 300**.
- 🏆 **Gamificação** — ranking mensal: **1 ponto por R$ + 50 de bônus por pedido**.
- 🛠️ **Painel admin completo** — CRUD de produtos/categorias, gestão de pedidos e clientes.
- 🧩 **Mock-first / Supabase-opcional** — funciona sem banco; degrada com elegância.
- 🔒 **Preços recalculados no servidor** — o backend nunca confia nos preços do cliente.

## 🖥️ Telas & Rotas

| Rota | Área | Descrição |
|------|------|-----------|
| `/` | Loja | Catálogo, busca, filtro por categoria, carrinho e topo do ranking |
| `/ranking` | Loja | Ranking mensal completo de clientes por pontos |
| `/confirmacao` | Loja | Confirmação do pedido, dados PIX e botão "Enviar no WhatsApp" |
| `/admin/login` | Admin | Login do administrador (Supabase Auth) |
| `/admin` | Admin | Dashboard com contagem de produtos/categorias |
| `/admin/produtos` | Admin | CRUD de produtos (preço, faixas de atacado, estoque) |
| `/admin/categorias` | Admin | CRUD de categorias |
| `/admin/pedidos` | Admin | Lista e detalhe de pedidos; troca de status |
| `/admin/clientes` | Admin | Lista, detalhe e edição de clientes |

> 📸 _Screenshots: adicione imagens em `docs/screenshots/` e referencie-as aqui._

## 🧩 Funcionalidades

**Cliente**
- Catálogo com categorias, busca e preços de atacado por faixa.
- Carrinho persistente (localStorage) com cálculo de totais em tempo real.
- Formulário de cliente em pt-BR com máscaras (CPF, telefone, CEP) e validação.
- Autopreenchimento de endereço por CEP (ViaCEP) e opções de frete por UF.
- Confirmação com dados PIX, mensagem pronta de WhatsApp e animação de confete. 🎉

**Gamificação**
- Ranking mensal dos melhores clientes (apenas pedidos pagos contam).
- Medalhas para o pódio (ouro/prata/bronze) e destaque da sua própria posição.

**Admin**
- Autenticação por e-mail/senha restrita à allowlist `ADMIN_EMAILS`.
- CRUD de produtos e categorias com validação via Zod.
- Gestão de pedidos com filtro por status/mês e atualização de status.
- Gestão de clientes com busca por nome/CPF e histórico de pedidos.

## 🏗️ Arquitetura & decisões

- **Mock-first / Supabase-opcional** — `isSupabaseConfigured()`
  (`frontend/src/lib/supabase/config.ts`) controla cada caminho de dados: leituras retornam
  mocks de `src/data/*` quando não há banco, ou consultam o Supabase (com `cache()` do React).
- **Preços recalculados no servidor** — a Server Action `src/server/orders/create-order.ts`
  **nunca confia no cliente**: re-busca os produtos, reaplica faixas de atacado e frete, e
  recalcula totais e pontos. Lógica de preço de cliente (`src/lib/pricing.ts`) e servidor
  ficam sempre em sincronia.
- **Checkout → WhatsApp/PIX** — `src/lib/whatsapp.ts` monta a mensagem e o link `wa.me`
  (número em `src/data/company.ts`); o pagamento acontece fora do app, via PIX.
- **Estado do carrinho** — `src/features/cart/CartContext.tsx` (Context + `useReducer`,
  consumido por `useCart`) é a fonte única de verdade, persistida em localStorage/sessionStorage.
- **Segurança** — catálogo é **public-read** via RLS; **escritas** acontecem só em Server
  Actions com a chave `service_role`; o admin fica atrás de **Supabase Auth + `ADMIN_EMAILS`**.

## 🛠️ Stack tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | **Next.js 16.2.9** (App Router) |
| UI | **React 19.2.4**, **TypeScript 5** |
| Estilo | **Tailwind CSS v4** (tokens OKLCH em `globals.css`, sem `tailwind.config`) |
| Componentes | **base-ui** (não Radix) com wrappers shadcn-style, ícones **lucide-react** |
| Validação | **Zod 4** |
| Backend | **Supabase** (`supabase-js` + `@supabase/ssr`) — opcional |
| UX | **sonner** (toasts), **next-themes** (dark default), **canvas-confetti** |
| Gerenciador | **pnpm** |

## 📂 Estrutura do projeto

```
capim-catalog/
└── frontend/                 # toda a aplicação Next.js
    ├── src/
    │   ├── app/              # rotas (App Router)
    │   │   ├── (site)/       # loja: /, /ranking, /confirmacao
    │   │   └── admin/        # painel admin (protegido)
    │   ├── features/         # cart, catalog, gamification, order, admin
    │   ├── components/       # UI (ui/ = wrappers base-ui), layout, tema
    │   ├── server/           # queries Supabase + server actions (server-only)
    │   ├── lib/              # supabase, pricing, validation, whatsapp, cep, format
    │   ├── data/             # mocks: products, categories, shipping, ranking, company
    │   ├── constants/        # regras de negócio (frete grátis, pontos, estados)
    │   └── types/            # tipos de domínio
    ├── supabase/
    │   ├── migrations/       # 0001_catalog, 0002_orders, 0003_customers
    │   └── README.md         # guia de configuração do banco
    └── scripts/seed-supabase.ts
```

## 🚀 Começando

> 🌐 **Só quer ver rodando?** Acesse a **[demo ao vivo](https://capim-catalog.vercel.app/)** — sem instalar nada.

**Pré-requisitos:** Node.js 20+ e pnpm.

```bash
cd frontend
pnpm install
pnpm dev
```

Abra **http://localhost:3002** (atenção: a porta é **3002**, não 3000).

> [!TIP]
> O app roda **sem Supabase** por padrão (mock-first) — você já vê o catálogo, o carrinho
> e o checkout funcionando com dados de exemplo, sem configurar nada.

### 🔌 Habilitando o Supabase (opcional)

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Copie `.env.local.example` → `.env.local` e preencha as variáveis (tabela abaixo).
3. Rode as migrations de `frontend/supabase/migrations/` (`0001` → `0003`).
4. Popule o banco a partir dos mocks: `pnpm seed`.
5. Crie o usuário admin em **Supabase Auth → Users** (o e-mail precisa estar em `ADMIN_EMAILS`).

Detalhes completos em [`frontend/supabase/README.md`](frontend/supabase/README.md).

## ⚙️ Scripts

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento em `http://localhost:3002` |
| `pnpm build` | Build de produção (`next build`) |
| `pnpm start` | Servidor de produção na porta 3002 |
| `pnpm lint` | ESLint (flat config) |
| `pnpm test` | Testes unitários (Vitest) |
| `pnpm seed` | Popula o Supabase a partir dos mocks de `src/data` |

## 🔑 Variáveis de ambiente

| Variável | Escopo | Descrição |
|----------|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Público | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Público | Chave anônima (leitura do catálogo) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Servidor** | Chave de escrita — **nunca exponha no cliente** |
| `ADMIN_EMAILS` | Servidor | Lista de e-mails admin (separados por vírgula) |

## 🗄️ Banco de dados

| Tabela | Função | RLS |
|--------|--------|-----|
| `categories` | Categorias de produtos | Leitura pública |
| `products` | Itens do catálogo (preço, faixas de atacado, estoque) | Leitura pública |
| `orders` | Pedidos (cliente, endereço, totais, pontos, status) | Privada |
| `order_items` | Itens de cada pedido | Privada |
| `customers` | Clientes (chaveados por CPF) | Privada |

Relações: `orders.customer_id → customers.id` · `order_items.order_id → orders.id` ·
`products.category_id → categories.id`.

## 📐 Regras de negócio

- **Frete grátis** acima de **R$ 300** (`FRETE_GRATIS_ACIMA`).
- **Sobretaxa de frete por região** — Sudeste +R$0, Sul +R$8, Centro-Oeste +R$14,
  Nordeste +R$20, Norte +R$28 (`src/data/shipping.ts`).
- **Pontos** — **1 ponto por R$** gasto **+ 50 de bônus por pedido** pago
  (`PONTOS_POR_REAL`, `PONTOS_BONUS_POR_PEDIDO` em `src/constants/index.ts`).

## 🧪 Qualidade

Testes unitários com **Vitest** cobrem a lógica pura (`src/lib`: preços/frete/pontos,
máscaras, validação, CEP, WhatsApp) e o reducer do carrinho. Verifique mudanças com:

```bash
pnpm test               # testes unitários (Vitest)
pnpm test:cov           # com cobertura
pnpm exec tsc --noEmit  # checagem de tipos
pnpm lint               # ESLint
# + checagem manual em http://localhost:3002
```

## 📝 Licença & aviso

Distribuído sob a licença **MIT**. Projeto de demonstração — empresa, PIX e CNPJ são fictícios.

---

<div align="center">

Feito com 🌿 e Next.js

</div>
