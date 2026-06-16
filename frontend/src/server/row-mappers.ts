import "server-only";

import type {
  Category,
  CustomerRecord,
  PriceTier,
  Product,
} from "@/types";

/** Tipos de linha do banco e mapeamento para os tipos de domínio (camelCase). */

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  accent: string;
  icon: string;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number | string;
  tiers: PriceTier[] | null;
  unit: string;
  min_qty: number;
  image: string | null;
  active: boolean;
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    accent: row.accent,
    icon: row.icon,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    description: row.description,
    price: Number(row.price),
    tiers: row.tiers ?? undefined,
    unit: row.unit,
    minQty: row.min_qty,
    image: row.image ?? undefined,
  };
}

export interface CustomerRow {
  id: string;
  cpf: string;
  name: string;
  phone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  observacao: string | null;
  created_at: string;
}

export function mapCustomer(row: CustomerRow): CustomerRecord {
  return {
    id: row.id,
    cpf: row.cpf,
    name: row.name,
    phone: row.phone,
    rua: row.rua,
    numero: row.numero,
    bairro: row.bairro,
    complemento: row.complemento,
    cidade: row.cidade,
    uf: row.uf,
    cep: row.cep,
    observacao: row.observacao,
    createdAtISO: row.created_at,
  };
}
