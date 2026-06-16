import { describe, it, expect } from "vitest";

import { stepQty } from "./cart";

describe("stepQty", () => {
  it("zera quando o próximo valor é 0 ou negativo", () => {
    expect(stepQty(3, 0, 1)).toBe(0);
    expect(stepQty(8, -1, 6)).toBe(0);
  });

  it("salta do zero direto para o mínimo", () => {
    expect(stepQty(0, 1, 1)).toBe(1); // minQty 1: adicionar do zero
    expect(stepQty(0, 1, 6)).toBe(6); // minQty 6: + no zero vai pro mínimo
    expect(stepQty(0, 3, 6)).toBe(6); // digitar abaixo do mínimo, vindo do zero
  });

  it("remove (0) ao reduzir abaixo do mínimo a partir de um valor > 0", () => {
    expect(stepQty(1, 0, 1)).toBe(0); // "−" no 1 (minQty 1) remove
    expect(stepQty(6, 5, 6)).toBe(0); // "−" no mínimo (minQty 6) remove
    expect(stepQty(8, 2, 6)).toBe(0); // digitar abaixo do mínimo remove
  });

  it("mantém valores válidos (>= mínimo)", () => {
    expect(stepQty(1, 2, 1)).toBe(2);
    expect(stepQty(6, 7, 6)).toBe(7);
    expect(stepQty(0, 6, 6)).toBe(6);
  });
});
