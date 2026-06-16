import { describe, it, expect } from "vitest";

import { reducer, initialState, EMPTY_CUSTOMER, type Action } from "./cart-reducer";

describe("cart reducer", () => {
  it("SET_QTY adiciona e atualiza quantidades", () => {
    const s1 = reducer(initialState, { type: "SET_QTY", productId: "a", qty: 3 });
    expect(s1.quantities).toEqual({ a: 3 });
    const s2 = reducer(s1, { type: "SET_QTY", productId: "a", qty: 7 });
    expect(s2.quantities).toEqual({ a: 7 });
  });

  it("SET_QTY com qty <= 0 remove o item", () => {
    const s1 = reducer(initialState, { type: "SET_QTY", productId: "a", qty: 3 });
    const s2 = reducer(s1, { type: "SET_QTY", productId: "a", qty: 0 });
    expect(s2.quantities).toEqual({});
  });

  it("CLEAR_ITEMS esvazia as quantidades", () => {
    const s1 = reducer(initialState, { type: "SET_QTY", productId: "a", qty: 3 });
    expect(reducer(s1, { type: "CLEAR_ITEMS" }).quantities).toEqual({});
  });

  it("PATCH_CUSTOMER mescla campos", () => {
    const s1 = reducer(initialState, {
      type: "PATCH_CUSTOMER",
      patch: { nome: "Ana" },
    });
    expect(s1.customer.nome).toBe("Ana");
    const s2 = reducer(s1, { type: "PATCH_CUSTOMER", patch: { uf: "SP" } });
    expect(s2.customer).toEqual({ ...EMPTY_CUSTOMER, nome: "Ana", uf: "SP" });
  });

  it("SET_DELIVERY define a modalidade", () => {
    expect(
      reducer(initialState, { type: "SET_DELIVERY", deliveryId: "sedex" }).deliveryId
    ).toBe("sedex");
  });

  it("HYDRATE marca hydrated e mescla o payload", () => {
    const s = reducer(initialState, {
      type: "HYDRATE",
      payload: { quantities: { a: 2 }, deliveryId: "retirada" },
    });
    expect(s.hydrated).toBe(true);
    expect(s.quantities).toEqual({ a: 2 });
    expect(s.deliveryId).toBe("retirada");
  });

  it("ação desconhecida retorna o mesmo estado", () => {
    const unknown = { type: "NOPE" } as unknown as Action;
    expect(reducer(initialState, unknown)).toBe(initialState);
  });

  it("é imutável (não muta o estado anterior)", () => {
    reducer(initialState, { type: "SET_QTY", productId: "a", qty: 3 });
    expect(initialState.quantities).toEqual({});
  });
});
