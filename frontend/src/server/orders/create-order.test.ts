import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Product } from "@/types";

// create-order importa módulos server-only e o cliente Supabase — todos mockados.
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => null }),
}));

const products: Product[] = [
  {
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
  { id: "agua", name: "Água", categoryId: "a", description: "", price: 2, unit: "un", minQty: 1 },
];

vi.mock("@/server/catalog", () => ({ getProducts: vi.fn(async () => products) }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => true }));

// Captura as linhas inseridas para verificar que os valores vêm do servidor.
const inserted: Record<string, unknown> = {};
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      const selectObj = {
        single: async () => {
          if (table === "customers") return { data: { id: "cust-1" }, error: null };
          if (table === "orders")
            return { data: { id: "ord-uuid", number: 1280 }, error: null };
          return { data: null, error: null };
        },
      };
      return {
        upsert: (row: unknown) => {
          inserted[table] = row;
          return { select: () => selectObj };
        },
        insert: (row: unknown) => {
          inserted[table] = row;
          const p = Promise.resolve({ error: null });
          return Object.assign(p, { select: () => selectObj });
        },
      };
    },
  }),
}));

import { createOrder } from "./create-order";

const customer = {
  nome: "Márcio",
  cpf: "12345678901",
  telefone: "",
  rua: "Rua A",
  numero: "1",
  bairro: "",
  complemento: "",
  cidade: "C",
  cep: "",
  uf: "SP",
  observacao: "",
};

describe("createOrder (server action)", () => {
  beforeEach(() => {
    for (const k of Object.keys(inserted)) delete inserted[k];
  });

  it("recalcula preços/total/pontos no servidor e persiste os valores recalculados", async () => {
    const order = await createOrder({
      items: [
        { productId: "dip", qty: 10 },
        { productId: "agua", qty: 1 },
      ],
      customer,
      deliveryId: "sedex",
    });
    // dip@10 = 4.9*10 = 49 ; agua = 2 ; subtotal 51 ; sedex/SP 28 ; total 79 ; pontos floor(79)+50
    expect(order.subtotal).toBe(51);
    expect(order.total).toBe(79);
    expect(order.points).toBe(129);
    expect(order.id).toBe("1280");
    expect(order.ref).toBe("ord-uuid");
    const orders = inserted.orders as Record<string, number>;
    expect(orders.subtotal).toBe(51);
    expect(orders.total).toBe(79);
    expect(orders.points).toBe(129);
  });

  it("rejeita CPF inválido (não 11 dígitos)", async () => {
    await expect(
      createOrder({ items: [{ productId: "dip", qty: 5 }], customer: { ...customer, cpf: "123" }, deliveryId: "" })
    ).rejects.toThrow("CPF inválido");
  });

  it("rejeita input fora dos limites (qty acima do teto)", async () => {
    await expect(
      createOrder({ items: [{ productId: "dip", qty: 100000 }], customer, deliveryId: "" })
    ).rejects.toThrow("Pedido inválido");
  });

  it("rejeita pedido sem nenhum produto válido", async () => {
    await expect(
      createOrder({ items: [{ productId: "fantasma", qty: 1 }], customer, deliveryId: "" })
    ).rejects.toThrow("Nenhum produto válido");
  });
});
