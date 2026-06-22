import "server-only";

import type { Category, Coupon, CustomerRecord, Product } from "@/types";
import type { Company } from "@/data/company";
import type { Database } from "@/types/supabase";

/**
 * Tipos de linha derivados do schema (`Database`) — fonte única, não podem
 * divergir das migrations — e mapeamento para os tipos de domínio (camelCase).
 */

type Tables = Database["public"]["Tables"];

export type CategoryRow = Tables["categories"]["Row"];
export type ProductRow = Tables["products"]["Row"];

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

export type CustomerRow = Tables["customers"]["Row"];

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

export type CouponRow = Tables["coupons"]["Row"];

export function mapCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minItems: row.min_items,
    minSubtotal: Number(row.min_subtotal),
    maxDiscount: row.max_discount === null ? null : Number(row.max_discount),
    active: row.active,
    maxUses: row.max_uses,
    currentUses: row.current_uses,
    expiresAtISO: row.expires_at,
  };
}

export type CompanySettingsRow = Tables["company_settings"]["Row"];

export function mapCompany(row: CompanySettingsRow): Company {
  return {
    name: row.name,
    tagline: row.tagline,
    whatsapp: row.whatsapp,
    atendente: row.atendente,
    logoUrl: row.logo_url,
    gamificationEnabled: row.gamification_enabled,
    pix: {
      titular: row.pix_titular,
      chaveTipo: row.pix_chave_tipo,
      chave: row.pix_chave,
      banco: row.pix_banco,
    },
  };
}
