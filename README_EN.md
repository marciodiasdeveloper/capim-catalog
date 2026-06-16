<div align="center">

# 🌿 Capim Catalog

### _Your neighborhood pharmacy, now online._

E-commerce and order management for a neighborhood pharmacy — a catalog with wholesale
pricing, **WhatsApp + PIX** checkout, ranking-based gamification and a full admin panel.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-capim--catalog.vercel.app-000000?logo=vercel&logoColor=white)](https://capim-catalog.vercel.app/)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-optional-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license--disclaimer)

**🇬🇧 English · [🇧🇷 Português](README.md)**

### 🔗 [Open the live demo →](https://capim-catalog.vercel.app/)

</div>

> [!NOTE]
> This is a **demo / portfolio** project. The company, PIX and CNPJ data
> (`12.345.678/0001-90`) in `frontend/src/data/company.ts` are **placeholders** —
> no real financial data is exposed.

---

## About

**Capim Catalog** is the online storefront of a Brazilian neighborhood pharmacy
(**Capim Farma**). Customers browse a catalog of medications and health products with
**quantity-tiered wholesale pricing**, build a cart, fill in their address with **CEP
(ZIP) autofill**, and place an order — sent over **WhatsApp** and paid via **PIX** (no
in-app payment). A **gamification** system rewards returning customers with a **monthly
points ranking**, and a full **admin panel** manages products, categories, orders and
customers.

The project is **mock-first**: it runs entirely without a database using sample data, and
persists to **Supabase** as soon as environment variables are set — with no code changes.

## ✨ Highlights

- 🛒 **Wholesale catalog** — quantity-tiered prices computed in real time.
- 💬 **WhatsApp + PIX checkout** — formatted order sent via `wa.me`; paid through PIX.
- 📍 **Address by CEP** — auto-fills street, neighborhood, city and state via ViaCEP.
- 🚚 **Region-based shipping** — per-region surcharge and **free shipping over R$300**.
- 🏆 **Gamification** — monthly ranking: **1 point per R$ + 50 bonus per order**.
- 🛠️ **Full admin panel** — products/categories CRUD, order and customer management.
- 🧩 **Mock-first / Supabase-optional** — works with no database; degrades gracefully.
- 🔒 **Server-side price recompute** — the backend never trusts client-sent prices.

## 🖥️ Screens & Routes

| Route | Area | Description |
|-------|------|-------------|
| `/` | Store | Catalog, search, category filter, cart and ranking preview |
| `/ranking` | Store | Full monthly customer ranking by points |
| `/confirmacao` | Store | Order confirmation, PIX details and "Send on WhatsApp" |
| `/admin/login` | Admin | Administrator login (Supabase Auth) |
| `/admin` | Admin | Dashboard with product/category counts |
| `/admin/produtos` | Admin | Product CRUD (price, wholesale tiers, stock) |
| `/admin/categorias` | Admin | Category CRUD |
| `/admin/pedidos` | Admin | Order list and detail; status updates |
| `/admin/clientes` | Admin | Customer list, detail and editing |

> 📸 _Screenshots: drop images into `docs/screenshots/` and reference them here._

## 🧩 Features

**Customer**
- Catalog with categories, search and tiered wholesale pricing.
- Persistent cart (localStorage) with real-time totals.
- pt-BR customer form with input masks (CPF, phone, CEP) and validation.
- CEP-based address autofill (ViaCEP) and per-state shipping options.
- Confirmation with PIX details, a ready-to-send WhatsApp message and confetti. 🎉

**Gamification**
- Monthly ranking of top customers (only paid orders count).
- Podium medals (gold/silver/bronze) and your own position highlighted.

**Admin**
- Email/password auth restricted to the `ADMIN_EMAILS` allowlist.
- Product and category CRUD with Zod validation.
- Order management with status/month filters and status updates.
- Customer management with name/CPF search and order history.

## 🏗️ Architecture & decisions

- **Mock-first / Supabase-optional** — `isSupabaseConfigured()`
  (`frontend/src/lib/supabase/config.ts`) gates every data path: reads return `src/data/*`
  mocks when unconfigured, or query Supabase (wrapped in React `cache()`).
- **Server-side price recompute** — the `src/server/orders/create-order.ts` Server Action
  **never trusts the client**: it re-fetches products, re-applies wholesale tiers and
  shipping, and recomputes totals and points. Client pricing (`src/lib/pricing.ts`) and
  server pricing stay in sync.
- **Checkout → WhatsApp/PIX** — `src/lib/whatsapp.ts` builds the message and `wa.me` link
  (number from `src/data/company.ts`); payment happens off-app via PIX.
- **Cart state** — `src/features/cart/CartContext.tsx` (Context + `useReducer`, consumed via
  `useCart`) is the single source of truth, persisted to localStorage/sessionStorage.
- **Security** — the catalog is **public-read** via RLS; **writes** happen only in Server
  Actions using the `service_role` key; admin sits behind **Supabase Auth + `ADMIN_EMAILS`**.

## 🛠️ Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16.2.9** (App Router) |
| UI | **React 19.2.4**, **TypeScript 5** |
| Styling | **Tailwind CSS v4** (OKLCH tokens in `globals.css`, no `tailwind.config`) |
| Components | **base-ui** (not Radix) with shadcn-style wrappers, **lucide-react** icons |
| Validation | **Zod 4** |
| Backend | **Supabase** (`supabase-js` + `@supabase/ssr`) — optional |
| UX | **sonner** (toasts), **next-themes** (dark default), **canvas-confetti** |
| Package manager | **pnpm** |

## 📂 Project structure

```
capim-catalog/
└── frontend/                 # the entire Next.js app
    ├── src/
    │   ├── app/              # routes (App Router)
    │   │   ├── (site)/       # store: /, /ranking, /confirmacao
    │   │   └── admin/        # admin panel (protected)
    │   ├── features/         # cart, catalog, gamification, order, admin
    │   ├── components/       # UI (ui/ = base-ui wrappers), layout, theme
    │   ├── server/           # Supabase queries + server actions (server-only)
    │   ├── lib/              # supabase, pricing, validation, whatsapp, cep, format
    │   ├── data/             # mocks: products, categories, shipping, ranking, company
    │   ├── constants/        # business rules (free shipping, points, states)
    │   └── types/            # domain types
    ├── supabase/
    │   ├── migrations/       # 0001_catalog, 0002_orders, 0003_customers
    │   └── README.md         # database setup guide
    └── scripts/seed-supabase.ts
```

## 🚀 Getting started

> 🌐 **Just want to see it live?** Open the **[live demo](https://capim-catalog.vercel.app/)** — nothing to install.

**Prerequisites:** Node.js 20+ and pnpm.

```bash
cd frontend
pnpm install
pnpm dev
```

Open **http://localhost:3002** (note: the port is **3002**, not 3000).

> [!TIP]
> The app runs **without Supabase** by default (mock-first) — you'll see the catalog, cart
> and checkout working with sample data, no configuration required.

### 🔌 Enabling Supabase (optional)

1. Create a project on [Supabase](https://supabase.com/).
2. Copy `.env.local.example` → `.env.local` and fill the variables (table below).
3. Run the migrations in `frontend/supabase/migrations/` (`0001` → `0003`).
4. Seed the database from the mocks: `pnpm seed`.
5. Create the admin user in **Supabase Auth → Users** (its email must be in `ADMIN_EMAILS`).

Full details in [`frontend/supabase/README.md`](frontend/supabase/README.md).

## ⚙️ Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Development server at `http://localhost:3002` |
| `pnpm build` | Production build (`next build`) |
| `pnpm start` | Production server on port 3002 |
| `pnpm lint` | ESLint (flat config) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm seed` | Seeds Supabase from the `src/data` mocks |

## 🔑 Environment variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anonymous key (catalog reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server** | Write key — **never expose to the client** |
| `ADMIN_EMAILS` | Server | Comma-separated list of admin emails |

## 🗄️ Database

| Table | Purpose | RLS |
|-------|---------|-----|
| `categories` | Product categories | Public read |
| `products` | Catalog items (price, wholesale tiers, stock) | Public read |
| `orders` | Orders (customer, address, totals, points, status) | Private |
| `order_items` | Line items per order | Private |
| `customers` | Customers (keyed by CPF) | Private |

Relations: `orders.customer_id → customers.id` · `order_items.order_id → orders.id` ·
`products.category_id → categories.id`.

## 📐 Business rules

- **Free shipping** over **R$300** (`FRETE_GRATIS_ACIMA`).
- **Region-based shipping surcharge** — Southeast +R$0, South +R$8, Midwest +R$14,
  Northeast +R$20, North +R$28 (`src/data/shipping.ts`).
- **Points** — **1 point per R$** spent **+ 50 bonus per paid order**
  (`PONTOS_POR_REAL`, `PONTOS_BONUS_POR_PEDIDO` in `src/constants/index.ts`).

## 🧪 Quality

Unit tests with **Vitest** cover the pure logic (`src/lib`: pricing/freight/points,
masks, validation, CEP, WhatsApp) and the cart reducer. Verify changes with:

```bash
pnpm test               # unit tests (Vitest)
pnpm test:cov           # with coverage
pnpm exec tsc --noEmit  # type-check
pnpm lint               # ESLint
# + manual check at http://localhost:3002
```

## 📝 License & disclaimer

Released under the **MIT** license. Demo project — company, PIX and CNPJ data are fictitious.

---

<div align="center">

Made with 🌿 and Next.js

</div>
