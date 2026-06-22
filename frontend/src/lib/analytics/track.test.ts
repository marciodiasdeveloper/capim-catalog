import { describe, expect, it } from "vitest";

import {
  isValidSessionId,
  newSessionId,
  safeHost,
  shouldTrackAdd,
} from "./track";
import { buildFunnel, overallConversion } from "./funnel";

describe("isValidSessionId", () => {
  it("aceita strings de 8 a 64 caracteres", () => {
    expect(isValidSessionId("a".repeat(8))).toBe(true);
    expect(isValidSessionId("a".repeat(64))).toBe(true);
    expect(isValidSessionId(newSessionId())).toBe(true);
  });

  it("rejeita curtas, longas e não-strings", () => {
    expect(isValidSessionId("short")).toBe(false);
    expect(isValidSessionId("a".repeat(65))).toBe(false);
    expect(isValidSessionId(123)).toBe(false);
    expect(isValidSessionId(null)).toBe(false);
    expect(isValidSessionId(undefined)).toBe(false);
  });
});

describe("safeHost", () => {
  it("extrai apenas o host (sem path/query)", () => {
    expect(safeHost("https://google.com/search?q=capim")).toBe("google.com");
    expect(safeHost("https://www.instagram.com/p/abc/")).toBe(
      "www.instagram.com"
    );
  });

  it("retorna null para vazio/ inválido", () => {
    expect(safeHost("")).toBeNull();
    expect(safeHost(null)).toBeNull();
    expect(safeHost(undefined)).toBeNull();
    expect(safeHost("not a url")).toBeNull();
  });
});

describe("shouldTrackAdd", () => {
  it("conta só quando a quantidade aumenta", () => {
    expect(shouldTrackAdd(0, 5)).toBe(true); // do zero ao mínimo
    expect(shouldTrackAdd(5, 6)).toBe(true); // incremento
  });

  it("ignora decremento, remoção e estabilidade", () => {
    expect(shouldTrackAdd(6, 5)).toBe(false);
    expect(shouldTrackAdd(5, 0)).toBe(false);
    expect(shouldTrackAdd(5, 5)).toBe(false);
  });
});

describe("buildFunnel", () => {
  const stages = [
    { key: "visitas", label: "Visitas", value: 100 },
    { key: "carrinho", label: "Carrinho", value: 40 },
    { key: "checkout", label: "Checkout", value: 20 },
    { key: "pago", label: "Pago", value: 10 },
  ];

  it("calcula largura relativa ao topo e conversão passo-a-passo", () => {
    const out = buildFunnel(stages);
    expect(out[0]).toMatchObject({ pctOfTop: 100, stepPct: null });
    expect(out[1]).toMatchObject({ pctOfTop: 40, stepPct: 40 });
    expect(out[2]).toMatchObject({ pctOfTop: 20, stepPct: 50 });
    expect(out[3]).toMatchObject({ pctOfTop: 10, stepPct: 50 });
  });

  it("retorna stepPct null quando a base anterior é zero", () => {
    const out = buildFunnel([
      { key: "a", label: "A", value: 0 },
      { key: "b", label: "B", value: 0 },
    ]);
    expect(out[0].pctOfTop).toBe(0);
    expect(out[1].stepPct).toBeNull();
  });

  it("overallConversion = último/primeiro", () => {
    expect(overallConversion(stages)).toBe(10);
    expect(overallConversion([{ key: "a", label: "A", value: 0 }])).toBe(0);
  });
});
