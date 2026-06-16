/** @vitest-environment jsdom */
import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

// Evita puxar a cadeia server-only via createOrder (CartContext o importa).
vi.mock("server-only", () => ({}));
vi.mock("@/server/orders/create-order", () => ({ createOrder: vi.fn() }));

import { CartProvider } from "./CartContext";
import { useCart } from "./useCart";
import { computeOrder } from "@/lib/pricing";
import type { Order, Product } from "@/types";

const products: Record<string, Product> = {
  dip: {
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
  },
  luva: {
    id: "luva",
    name: "Luva",
    categoryId: "a",
    description: "",
    price: 10,
    unit: "cx",
    minQty: 3,
  },
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider products={products}>{children}</CartProvider>;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("CartProvider", () => {
  it("adiciona itens e calcula contagem/subtotal (com atacado)", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.setQty("dip", 10));
    expect(result.current.count).toBe(10);
    expect(result.current.subtotal).toBe(49); // 4.9 * 10
  });

  it("aplica o mínimo do produto na contagem/subtotal", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.setQty("luva", 1)); // minQty 3
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(30);
  });

  it("finalizeOrder bate com computeOrder (paridade cliente/servidor)", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.setQty("dip", 10);
      result.current.patchCustomer({ nome: "Ana", uf: "SP" });
      result.current.setDelivery("sedex");
    });

    let order: Order | undefined;
    act(() => {
      order = result.current.finalizeOrder();
    });

    const expected = computeOrder(
      Object.values(products),
      [{ productId: "dip", qty: 10 }],
      "SP",
      "sedex"
    );
    expect(order?.subtotal).toBe(expected.subtotal);
    expect(order?.total).toBe(expected.total);
    expect(order?.points).toBe(expected.points);
    expect(order?.items).toEqual(expected.orderItems);
    expect(order?.delivery).toEqual(expected.delivery);
  });
});
