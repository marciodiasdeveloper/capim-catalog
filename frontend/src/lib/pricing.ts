/**
 * Cálculo de preços, faixas de atacado, frete, pontos e totais do pedido.
 * Funções puras, compartilhadas entre cliente (carrinho) e servidor
 * (`create-order`) — a fonte única de verdade para qualquer cálculo monetário.
 */

import type { CartItem, OrderItem, Product } from "@/types";
import {
  FRETE_GRATIS_ACIMA,
  PONTOS_BONUS_POR_PEDIDO,
  PONTOS_POR_REAL,
} from "@/constants";
import { findDeliveryOption } from "@/data/shipping";

/**
 * Arredonda um valor monetário para 2 casas (centavos), eliminando o erro de
 * ponto flutuante de IEEE-754 (ex.: 4.9 * 3 = 14.700000000000001 → 14.7).
 * Todo dinheiro persistido/comparado/exibido passa por aqui.
 */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface UnitPrice {
  price: number;
  isWholesale: boolean;
}

/**
 * Preço unitário aplicável para a quantidade. Entre as faixas de atacado que a
 * quantidade atinge, escolhe o **menor preço** (determinístico, sem depender da
 * ordem das faixas) e nunca acima do preço de varejo.
 */
export function getUnitPrice(product: Product, qty: number): UnitPrice {
  const tiers = product.tiers ?? [];
  const qualifying = tiers.filter((t) => qty >= t.minQty);
  if (qualifying.length === 0) {
    return { price: product.price, isWholesale: false };
  }
  const best = Math.min(...qualifying.map((t) => t.price));
  // Faixa mal configurada (>= varejo) não pode encarecer o varejo.
  if (best >= product.price) {
    return { price: product.price, isWholesale: false };
  }
  return { price: best, isWholesale: true };
}

/** Total da linha (preço unitário × quantidade), arredondado a centavos. */
export function getLineTotal(product: Product, qty: number): number {
  return roundMoney(getUnitPrice(product, qty).price * qty);
}

export interface CartTotals {
  subtotal: number;
  count: number;
}

/** Subtotal (somando linhas já arredondadas) e contagem de itens. */
export function computeTotals(items: CartItem[]): CartTotals {
  const subtotal = roundMoney(
    items.reduce((acc, it) => acc + getLineTotal(it.product, it.qty), 0)
  );
  const count = items.reduce((acc, it) => acc + it.qty, 0);
  return { subtotal, count };
}

export interface Freight {
  frete: number;
  freteGratis: boolean;
}

/**
 * Resolve o frete: grátis ao atingir o limite (`FRETE_GRATIS_ACIMA`); senão o
 * preço da modalidade escolhida. `deliveryPrice` null = nenhuma entrega selecionada.
 */
export function resolveFreight(
  subtotal: number,
  deliveryPrice: number | null
): Freight {
  const freteGratis = subtotal >= FRETE_GRATIS_ACIMA;
  if (deliveryPrice == null) return { frete: 0, freteGratis };
  return { frete: freteGratis ? 0 : deliveryPrice, freteGratis };
}

/** Pontos de gamificação do pedido: 1 ponto por real (piso) + bônus fixo. */
export function computePoints(total: number): number {
  return Math.floor(roundMoney(total)) * PONTOS_POR_REAL + PONTOS_BONUS_POR_PEDIDO;
}

/**
 * Converte (produto, quantidade) num item de pedido, aplicando a quantidade
 * mínima do produto e arredondando o total da linha. Usado pelos dois caminhos
 * de criação de pedido (local e servidor) para garantir consistência.
 */
export function toOrderItem(product: Product, qty: number): OrderItem {
  const clampedQty = Math.max(qty, product.minQty);
  const { price, isWholesale } = getUnitPrice(product, clampedQty);
  return {
    productId: product.id,
    name: product.name,
    qty: clampedQty,
    unitPrice: price,
    lineTotal: roundMoney(price * clampedQty),
    isWholesale,
  };
}

export interface ComputedOrder {
  orderItems: OrderItem[];
  subtotal: number;
  delivery: { label: string; price: number; eta?: string } | null;
  frete: number;
  freteGratis: boolean;
  total: number;
  points: number;
}

/**
 * Cálculo autoritativo do pedido a partir do catálogo: mapeia itens (ignorando
 * productIds inexistentes), aplica minQty/atacado, resolve frete e total e
 * calcula os pontos. Pura e testável; consumida pelo `create-order` (servidor)
 * e pelo fallback local do carrinho, mantendo cliente e servidor em sincronia.
 */
export function computeOrder(
  products: Product[],
  items: { productId: string; qty: number }[],
  uf: string,
  deliveryId: string
): ComputedOrder {
  const byId = new Map(products.map((p) => [p.id, p]));
  const orderItems = items
    .map(({ productId, qty }) => {
      const product = byId.get(productId);
      return product ? toOrderItem(product, qty) : null;
    })
    .filter((it): it is OrderItem => it !== null);

  const subtotal = roundMoney(orderItems.reduce((a, it) => a + it.lineTotal, 0));
  const option = findDeliveryOption(uf, deliveryId) ?? null;
  const { frete, freteGratis } = resolveFreight(
    subtotal,
    option ? option.price : null
  );
  const total = roundMoney(subtotal + frete);
  const points = computePoints(total);
  const delivery = option
    ? { label: option.label, price: frete, eta: option.eta }
    : null;

  return { orderItems, subtotal, delivery, frete, freteGratis, total, points };
}
