import { describe, it, expect } from "vitest";

import { evaluateCoupon } from "./coupon";
import type { Coupon } from "@/types";

const base: Coupon = {
  id: "c1",
  code: "TEST",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minItems: 0,
  minSubtotal: 0,
  maxDiscount: null,
  active: true,
  maxUses: null,
  currentUses: 0,
  expiresAtISO: null,
};

describe("evaluateCoupon", () => {
  it("aplica desconto percentual (arredondado)", () => {
    const r = evaluateCoupon(base, { subtotal: 100, count: 3 });
    expect(r.ok).toBe(true);
    expect(r.discount).toBe(10);
  });

  it("aplica desconto fixo", () => {
    const r = evaluateCoupon(
      { ...base, discountType: "fixed", discountValue: 15 },
      { subtotal: 100, count: 1 }
    );
    expect(r.discount).toBe(15);
  });

  it("respeita o teto de desconto (maxDiscount)", () => {
    const r = evaluateCoupon(
      { ...base, discountValue: 50, maxDiscount: 20 },
      { subtotal: 100, count: 1 }
    );
    expect(r.discount).toBe(20);
  });

  it("nunca desconta mais que o subtotal", () => {
    const r = evaluateCoupon(
      { ...base, discountType: "fixed", discountValue: 200 },
      { subtotal: 50, count: 1 }
    );
    expect(r.discount).toBe(50);
  });

  it("cupom inativo não aplica", () => {
    const r = evaluateCoupon({ ...base, active: false }, { subtotal: 100, count: 1 });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/inativo/i);
  });

  it("cupom expirado não aplica", () => {
    const r = evaluateCoupon(
      { ...base, expiresAtISO: "2020-01-01T00:00:00.000Z" },
      { subtotal: 100, count: 1, nowISO: "2026-01-01T00:00:00.000Z" }
    );
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/expirado/i);
  });

  it("cupom esgotado (maxUses) não aplica", () => {
    const r = evaluateCoupon(
      { ...base, maxUses: 5, currentUses: 5 },
      { subtotal: 100, count: 1 }
    );
    expect(r.reason).toMatch(/esgotado/i);
  });

  it("abaixo do mínimo de itens não aplica e dá hint", () => {
    const r = evaluateCoupon({ ...base, minItems: 4 }, { subtotal: 100, count: 2 });
    expect(r.ok).toBe(false);
    expect(r.discount).toBe(0);
    expect(r.hint).toMatch(/2 itens/);
  });

  it("abaixo do subtotal mínimo não aplica", () => {
    const r = evaluateCoupon(
      { ...base, minSubtotal: 200 },
      { subtotal: 100, count: 1 }
    );
    expect(r.ok).toBe(false);
    expect(r.hint).toMatch(/mínimo/i);
  });
});
