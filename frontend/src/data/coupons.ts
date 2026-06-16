import type { Coupon } from "@/types";

/**
 * Cupons mockados (fallback sem Supabase). Único ponto a editar para demonstrar
 * o fluxo sem banco. Códigos sempre em MAIÚSCULAS.
 */
export const COUPONS: Coupon[] = [
  {
    id: "bemvindo10",
    code: "BEMVINDO10",
    description: "10% de boas-vindas (até R$ 30)",
    discountType: "percentage",
    discountValue: 10,
    minItems: 0,
    minSubtotal: 0,
    maxDiscount: 30,
    active: true,
    maxUses: null,
    currentUses: 0,
    expiresAtISO: null,
  },
  {
    id: "leve3",
    code: "LEVE3",
    description: "R$ 15 de desconto levando 3+ itens",
    discountType: "fixed",
    discountValue: 15,
    minItems: 3,
    minSubtotal: 0,
    maxDiscount: null,
    active: true,
    maxUses: 100,
    currentUses: 12,
    expiresAtISO: null,
  },
  {
    id: "inativo-exemplo",
    code: "DESATIVADO",
    description: "Cupom inativo (exemplo)",
    discountType: "percentage",
    discountValue: 20,
    minItems: 0,
    minSubtotal: 0,
    maxDiscount: null,
    active: false,
    maxUses: null,
    currentUses: 0,
    expiresAtISO: null,
  },
];

export const COUPON_BY_CODE: Record<string, Coupon> = Object.fromEntries(
  COUPONS.map((c) => [c.code, c])
);
