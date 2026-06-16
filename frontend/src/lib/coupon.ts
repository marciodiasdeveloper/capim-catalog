/**
 * Avaliação pura de cupom: valida as regras (ativo, validade, usos, mínimos) e
 * calcula o desconto em R$. Compartilhada entre cliente (exibição no carrinho) e
 * servidor (`computeOrder`), garantindo o mesmo resultado nos dois lados.
 */

import type { Coupon } from "@/types";
import { roundMoney } from "./pricing";

export interface CouponContext {
  subtotal: number;
  /** Total de itens no carrinho (soma das quantidades). */
  count: number;
  /** Momento atual em ISO (para checar expiração). Default: agora. */
  nowISO?: string;
}

export interface CouponEvaluation {
  /** Desconto em R$ aplicável (0 quando não qualifica). */
  discount: number;
  /** True quando o cupom é válido E o carrinho qualifica. */
  ok: boolean;
  /** Motivo de o cupom não valer (inativo/expirado/esgotado). */
  reason: string | null;
  /** O que falta para o carrinho qualificar (abaixo do mínimo). */
  hint: string | null;
}

/** Desconto bruto antes dos limites (teto e subtotal). */
function rawDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discountType === "percentage") {
    return (subtotal * coupon.discountValue) / 100;
  }
  return coupon.discountValue;
}

export function evaluateCoupon(
  coupon: Coupon,
  { subtotal, count, nowISO }: CouponContext
): CouponEvaluation {
  const invalid = (reason: string): CouponEvaluation => ({
    discount: 0,
    ok: false,
    reason,
    hint: null,
  });

  if (!coupon.active) return invalid("Cupom inativo.");
  if (coupon.expiresAtISO) {
    const now = nowISO ?? new Date().toISOString();
    if (now > coupon.expiresAtISO) return invalid("Cupom expirado.");
  }
  if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
    return invalid("Cupom esgotado.");
  }

  // Cupom válido em si — agora checa se o carrinho qualifica.
  if (count < coupon.minItems) {
    const faltam = coupon.minItems - count;
    return {
      discount: 0,
      ok: false,
      reason: null,
      hint: `Adicione mais ${faltam} ${faltam === 1 ? "item" : "itens"} para usar este cupom.`,
    };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      discount: 0,
      ok: false,
      reason: null,
      hint: "Pedido abaixo do mínimo para este cupom.",
    };
  }

  // Aplica teto (percentuais) e nunca desconta mais que o subtotal.
  let discount = rawDiscount(coupon, subtotal);
  if (coupon.maxDiscount !== null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = roundMoney(Math.min(discount, subtotal));

  if (discount <= 0) return invalid("Cupom sem desconto aplicável.");

  return { discount, ok: true, reason: null, hint: null };
}
