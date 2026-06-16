import { describe, it, expect } from "vitest";

import { getDeliveryOptions, findDeliveryOption } from "@/data/shipping";

describe("getDeliveryOptions", () => {
  it("sem UF retorna lista vazia", () => {
    expect(getDeliveryOptions("")).toEqual([]);
  });

  it("UF do Sudeste (SP) não tem sobretaxa", () => {
    const opts = getDeliveryOptions("SP");
    expect(opts.map((o) => o.id)).toEqual(["retirada", "sedex", "transportadora"]);
    expect(opts.find((o) => o.id === "retirada")?.price).toBe(0);
    expect(opts.find((o) => o.id === "sedex")?.price).toBe(28);
    expect(opts.find((o) => o.id === "transportadora")?.price).toBe(42);
  });

  it("UF do Norte (AM) aplica sobretaxa de 28", () => {
    const opts = getDeliveryOptions("AM");
    expect(opts.find((o) => o.id === "sedex")?.price).toBe(56);
    expect(opts.find((o) => o.id === "transportadora")?.price).toBe(70);
    expect(opts.find((o) => o.id === "retirada")?.price).toBe(0);
  });

  it("UF desconhecida cai no padrão (sudeste, sem sobretaxa)", () => {
    expect(getDeliveryOptions("ZZ").find((o) => o.id === "sedex")?.price).toBe(28);
  });

  it("toda opção tem prazo (eta)", () => {
    for (const o of getDeliveryOptions("SP")) {
      expect(o.eta).toBeTruthy();
    }
  });
});

describe("findDeliveryOption", () => {
  it("encontra por id", () => {
    expect(findDeliveryOption("SP", "sedex")?.label).toBe("Sedex");
  });
  it("retorna undefined para id inexistente", () => {
    expect(findDeliveryOption("SP", "drone")).toBeUndefined();
  });
  it("retorna undefined sem UF", () => {
    expect(findDeliveryOption("", "sedex")).toBeUndefined();
  });
});
