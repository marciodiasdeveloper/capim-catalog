import { describe, it, expect } from "vitest";

import {
  roundMoney,
  getUnitPrice,
  getLineTotal,
  computeTotals,
  resolveFreight,
  computePoints,
  toOrderItem,
  computeOrder,
} from "./pricing";
import type { Product } from "@/types";
import { FRETE_GRATIS_ACIMA, PONTOS_BONUS_POR_PEDIDO } from "@/constants";

const tiered: Product = {
  id: "dip",
  name: "Dipirona",
  categoryId: "a",
  description: "",
  price: 6.9,
  tiers: [
    { minQty: 5, price: 5.9 },
    { minQty: 10, price: 4.9 },
  ],
  unit: "cx",
  minQty: 1,
};
const noTier: Product = {
  id: "agua",
  name: "Água",
  categoryId: "a",
  description: "",
  price: 2,
  unit: "un",
  minQty: 1,
};
const minQty3: Product = {
  id: "luva",
  name: "Luva",
  categoryId: "a",
  description: "",
  price: 10,
  unit: "cx",
  minQty: 3,
};

describe("roundMoney", () => {
  it("elimina erro de ponto flutuante a centavos", () => {
    expect(roundMoney(4.9 * 3)).toBe(14.7);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(49.00000000001)).toBe(49);
  });
});

describe("getUnitPrice", () => {
  it("produto sem faixas usa o preço de varejo", () => {
    expect(getUnitPrice(noTier, 100)).toEqual({ price: 2, isWholesale: false });
  });
  it("abaixo da menor faixa fica no varejo", () => {
    expect(getUnitPrice(tiered, 1)).toEqual({ price: 6.9, isWholesale: false });
  });
  it("no limite da faixa aplica atacado", () => {
    expect(getUnitPrice(tiered, 5)).toEqual({ price: 5.9, isWholesale: true });
    expect(getUnitPrice(tiered, 7)).toEqual({ price: 5.9, isWholesale: true });
    expect(getUnitPrice(tiered, 10)).toEqual({ price: 4.9, isWholesale: true });
  });
  it("com faixas de mesmo minQty escolhe o MENOR preço (determinístico)", () => {
    const dup: Product = {
      ...tiered,
      tiers: [
        { minQty: 5, price: 5.9 },
        { minQty: 5, price: 4.9 },
      ],
    };
    expect(getUnitPrice(dup, 5)).toEqual({ price: 4.9, isWholesale: true });
  });
  it("faixa acima do varejo nunca encarece (cai no varejo)", () => {
    const inverted: Product = { ...tiered, tiers: [{ minQty: 5, price: 9.9 }] };
    expect(getUnitPrice(inverted, 5)).toEqual({ price: 6.9, isWholesale: false });
  });
});

describe("getLineTotal", () => {
  it("arredonda o total da linha", () => {
    expect(getLineTotal(tiered, 3)).toBe(20.7); // 6.9 * 3
    expect(getLineTotal(tiered, 10)).toBe(49); // 4.9 * 10
  });
});

describe("computeTotals", () => {
  it("soma linhas e conta itens", () => {
    const totals = computeTotals([
      { product: tiered, qty: 10 },
      { product: noTier, qty: 1 },
    ]);
    expect(totals).toEqual({ subtotal: 51, count: 11 });
  });
  it("carrinho vazio", () => {
    expect(computeTotals([])).toEqual({ subtotal: 0, count: 0 });
  });
});

describe("resolveFreight", () => {
  it("cobra o frete abaixo do limite", () => {
    expect(resolveFreight(100, 28)).toEqual({ frete: 28, freteGratis: false });
  });
  it("frete grátis ao atingir o limite", () => {
    expect(resolveFreight(FRETE_GRATIS_ACIMA, 28)).toEqual({
      frete: 0,
      freteGratis: true,
    });
  });
  it("sem entrega selecionada o frete é 0", () => {
    expect(resolveFreight(100, null)).toEqual({ frete: 0, freteGratis: false });
    expect(resolveFreight(500, null)).toEqual({ frete: 0, freteGratis: true });
  });
});

describe("computePoints", () => {
  it("1 ponto por real (piso) + bônus fixo", () => {
    expect(computePoints(109.9)).toBe(109 + PONTOS_BONUS_POR_PEDIDO);
    expect(computePoints(300)).toBe(350);
    expect(computePoints(0)).toBe(PONTOS_BONUS_POR_PEDIDO);
  });
});

describe("toOrderItem", () => {
  it("aplica a quantidade mínima do produto", () => {
    expect(toOrderItem(minQty3, 1)).toEqual({
      productId: "luva",
      name: "Luva",
      qty: 3,
      unitPrice: 10,
      lineTotal: 30,
      isWholesale: false,
    });
  });
  it("aplica atacado e arredonda", () => {
    expect(toOrderItem(tiered, 10)).toEqual({
      productId: "dip",
      name: "Dipirona",
      qty: 10,
      unitPrice: 4.9,
      lineTotal: 49,
      isWholesale: true,
    });
  });
});

describe("computeOrder", () => {
  const catalog = [tiered, noTier, minQty3];

  it("calcula itens, subtotal, frete, total e pontos", () => {
    const r = computeOrder(
      catalog,
      [
        { productId: "dip", qty: 10 },
        { productId: "agua", qty: 1 },
      ],
      "SP",
      "sedex"
    );
    expect(r.orderItems).toHaveLength(2);
    expect(r.subtotal).toBe(51);
    expect(r.delivery).toEqual({
      label: "Sedex",
      price: 28,
      eta: "2 a 4 dias úteis",
    });
    expect(r.frete).toBe(28);
    expect(r.total).toBe(79);
    expect(r.points).toBe(129);
  });

  it("ignora productId inexistente", () => {
    const r = computeOrder(
      catalog,
      [
        { productId: "fantasma", qty: 1 },
        { productId: "agua", qty: 1 },
      ],
      "SP",
      "sedex"
    );
    expect(r.orderItems).toHaveLength(1);
    expect(r.subtotal).toBe(2);
  });

  it("frete grátis quando o subtotal cruza o limite, mesmo com entrega paga", () => {
    const r = computeOrder(catalog, [{ productId: "agua", qty: 200 }], "SP", "sedex");
    expect(r.subtotal).toBe(400);
    expect(r.frete).toBe(0);
    expect(r.total).toBe(400);
    expect(r.points).toBe(450);
  });

  it("clampa a quantidade ao mínimo do produto", () => {
    const r = computeOrder(catalog, [{ productId: "luva", qty: 1 }], "SP", "sedex");
    expect(r.orderItems[0].qty).toBe(3);
    expect(r.subtotal).toBe(30);
  });

  it("sem entrega selecionada, frete 0 e delivery null", () => {
    const r = computeOrder(catalog, [{ productId: "agua", qty: 1 }], "SP", "");
    expect(r.delivery).toBeNull();
    expect(r.frete).toBe(0);
    expect(r.total).toBe(2);
  });
});
