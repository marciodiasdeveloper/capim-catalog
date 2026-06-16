"use server";

import type { Coupon } from "@/types";
import { getCouponByCode } from "@/server/coupons";

export interface ApplyCouponResult {
  coupon?: Coupon;
  error?: string;
}

/**
 * Valida um código de cupom (existe, ativo, dentro da validade/usos) e devolve o
 * cupom. As regras de carrinho (mínimo de itens/subtotal) e o desconto final são
 * avaliados reativamente no carrinho e, de forma autoritativa, no `create-order`.
 */
export async function applyCoupon(code: string): Promise<ApplyCouponResult> {
  const trimmed = (code ?? "").trim();
  if (!trimmed || trimmed.length > 40) return { error: "Código inválido." };

  let coupon: Coupon | null = null;
  try {
    coupon = await getCouponByCode(trimmed);
  } catch {
    return { error: "Não foi possível validar o cupom agora." };
  }
  if (!coupon) return { error: "Cupom inválido ou inativo." };

  if (coupon.expiresAtISO && new Date().toISOString() > coupon.expiresAtISO) {
    return { error: "Cupom expirado." };
  }
  if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
    return { error: "Cupom esgotado." };
  }

  return { coupon };
}
