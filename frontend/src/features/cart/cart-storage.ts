/**
 * Leitura validada do estado persistido (localStorage/sessionStorage). Usa zod
 * para descartar blobs corrompidos/desatualizados em vez de confiar em casts.
 */

import { z } from "zod";

import type { Order } from "@/types";
import { EMPTY_CUSTOMER, type CartState } from "./cart-reducer";

const fullCustomerSchema = z.object({
  nome: z.string(),
  cpf: z.string(),
  telefone: z.string(),
  rua: z.string(),
  numero: z.string(),
  bairro: z.string(),
  complemento: z.string(),
  cidade: z.string(),
  cep: z.string(),
  uf: z.string(),
  observacao: z.string(),
});

const storedCartSchema = z.object({
  quantities: z.record(z.string(), z.number()).optional(),
  customer: fullCustomerSchema.partial().optional(),
  deliveryId: z.string().optional(),
});

/** Carrinho salvo: quantidades + cliente (mesclado sobre o vazio) + entrega. */
export function parseStoredCart(raw: string | null): Partial<CartState> | null {
  if (!raw) return null;
  try {
    const parsed = storedCartSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    return {
      quantities: parsed.data.quantities ?? {},
      customer: { ...EMPTY_CUSTOMER, ...(parsed.data.customer ?? {}) },
      deliveryId: parsed.data.deliveryId ?? "",
    };
  } catch {
    return null;
  }
}

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  qty: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
  isWholesale: z.boolean(),
});

const orderSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  items: z.array(orderItemSchema),
  customer: fullCustomerSchema,
  delivery: z
    .object({
      label: z.string(),
      price: z.number(),
      eta: z.string().optional(),
    })
    .nullable()
    .default(null),
  subtotal: z.number(),
  frete: z.number(),
  total: z.number(),
  points: z.number().optional(),
  createdAtISO: z.string(),
});

/** Último pedido salvo. Descarta corrompidos e faz backfill de `points` antigo. */
export function parseStoredOrder(raw: string | null): Order | null {
  if (!raw) return null;
  try {
    const parsed = orderSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const d = parsed.data;
    return {
      id: d.id,
      ref: d.ref,
      items: d.items,
      customer: d.customer,
      delivery: d.delivery,
      subtotal: d.subtotal,
      frete: d.frete,
      total: d.total,
      points: d.points ?? 0,
      createdAtISO: d.createdAtISO,
    };
  } catch {
    return null;
  }
}
