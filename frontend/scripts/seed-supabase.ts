/**
 * Popula o Supabase com as categorias e produtos do mock (src/data).
 *
 * Uso:
 *   1. Preencha .env.local (inclui SUPABASE_SERVICE_ROLE_KEY)
 *   2. Rode o SQL de schema: supabase/migrations/0001_catalog.sql
 *   3. npm run seed
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { CATEGORIES } from "../src/data/categories";
import { PRODUCTS } from "../src/data/products";
import { COMPANY } from "../src/data/company";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "✗ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  const categories = CATEGORIES.map((c, index) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    accent: c.accent,
    icon: c.icon,
    sort_order: index,
  }));

  const { error: categoriesError } = await supabase
    .from("categories")
    .upsert(categories);
  if (categoriesError) throw categoriesError;
  console.log(`✓ ${categories.length} categorias inseridas`);

  const products = PRODUCTS.map((p) => ({
    id: p.id,
    category_id: p.categoryId,
    name: p.name,
    description: p.description,
    price: p.price,
    tiers: p.tiers ?? null,
    unit: p.unit,
    min_qty: p.minQty,
    image: p.image ?? null,
    active: true,
  }));

  const { error: productsError } = await supabase
    .from("products")
    .upsert(products);
  if (productsError) throw productsError;
  console.log(`✓ ${products.length} produtos inseridos`);

  const { error: companyError } = await supabase.from("company_settings").upsert({
    id: "default",
    name: COMPANY.name,
    tagline: COMPANY.tagline,
    whatsapp: COMPANY.whatsapp,
    atendente: COMPANY.atendente,
    pix_titular: COMPANY.pix.titular,
    pix_chave_tipo: COMPANY.pix.chaveTipo,
    pix_chave: COMPANY.pix.chave,
    pix_banco: COMPANY.pix.banco,
    logo_url: COMPANY.logoUrl ?? null,
  });
  if (companyError) throw companyError;
  console.log("✓ company_settings (default) inserido");
}

main()
  .then(() => {
    console.log("Seed concluído.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("✗ Falha no seed:", error);
    process.exit(1);
  });
