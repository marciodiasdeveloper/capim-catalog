/** Cálculo de preços, faixas de atacado e totais do pedido. Funções puras. */

import type { CartItem, Product } from "@/types";

export interface UnitPrice {
  price: number;
  isWholesale: boolean;
}

/** Retorna o preço unitário aplicável para a quantidade, considerando faixas de atacado. */
export function getUnitPrice(product: Product, qty: number): UnitPrice {
  const tiers = product.tiers;
  if (!tiers || tiers.length === 0) {
    return { price: product.price, isWholesale: false };
  }
  // Maior minQty que a quantidade atinge vence (faixas ordenadas desc).
  const best = [...tiers]
    .sort((a, b) => b.minQty - a.minQty)
    .find((t) => qty >= t.minQty);

  return best
    ? { price: best.price, isWholesale: true }
    : { price: product.price, isWholesale: false };
}

export function getLineTotal(product: Product, qty: number): number {
  return getUnitPrice(product, qty).price * qty;
}

export interface CartTotals {
  subtotal: number;
  count: number;
}

/** Subtotal e contagem de itens. O frete é resolvido à parte (depende da entrega). */
export function computeTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce(
    (acc, it) => acc + getLineTotal(it.product, it.qty),
    0
  );
  const count = items.reduce((acc, it) => acc + it.qty, 0);
  return { subtotal, count };
}
