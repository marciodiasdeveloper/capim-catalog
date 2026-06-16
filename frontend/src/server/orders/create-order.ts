"use server";

import { z } from "zod";

import type { CartItem, Order, OrderItem } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProducts } from "@/server/catalog";
import { computeTotals, getUnitPrice } from "@/lib/pricing";
import { findDeliveryOption } from "@/data/shipping";
import { onlyDigits } from "@/lib/format";
import {
  FRETE_GRATIS_ACIMA,
  PONTOS_BONUS_POR_PEDIDO,
  PONTOS_POR_REAL,
} from "@/constants";

const inputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        qty: z.coerce.number().int().min(1),
      })
    )
    .min(1),
  customer: z.object({
    nome: z.string().trim().min(1),
    cpf: z.string(),
    telefone: z.string().default(""),
    rua: z.string().default(""),
    numero: z.string().default(""),
    bairro: z.string().default(""),
    complemento: z.string().default(""),
    cidade: z.string().default(""),
    cep: z.string().default(""),
    uf: z.string().default(""),
    observacao: z.string().default(""),
  }),
  deliveryId: z.string().default(""),
});

export type CreateOrderInput = z.input<typeof inputSchema>;

/**
 * Cria o pedido recalculando TODO o preço no servidor a partir do catálogo do
 * banco — nunca confia nos valores vindos do cliente. Persiste e devolve o
 * pedido autoritativo (usado na confirmação e no ranking).
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase não configurado.");
  }

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) throw new Error("Pedido inválido.");
  const { items, customer, deliveryId } = parsed.data;

  // CPF é a chave do cliente: exige 11 dígitos (evita colapsar clientes em cpf "").
  if (onlyDigits(customer.cpf).length !== 11) {
    throw new Error("CPF inválido.");
  }

  // Recalcula a partir dos preços reais do banco.
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));

  const cartItems: CartItem[] = items
    .map(({ productId, qty }) => {
      const product = byId.get(productId);
      if (!product) return null;
      return { product, qty: Math.max(qty, product.minQty) };
    })
    .filter((it): it is CartItem => it !== null);

  if (cartItems.length === 0) throw new Error("Nenhum produto válido no pedido.");

  const orderItems: OrderItem[] = cartItems.map(({ product, qty }) => {
    const { price, isWholesale } = getUnitPrice(product, qty);
    return {
      productId: product.id,
      name: product.name,
      qty,
      unitPrice: price,
      lineTotal: price * qty,
      isWholesale,
    };
  });

  const { subtotal } = computeTotals(cartItems);
  const delivery = findDeliveryOption(customer.uf, deliveryId) ?? null;
  const freteGratis = subtotal >= FRETE_GRATIS_ACIMA;
  const frete = delivery ? (freteGratis ? 0 : delivery.price) : 0;
  const total = subtotal + frete;
  const points = Math.floor(total) * PONTOS_POR_REAL + PONTOS_BONUS_POR_PEDIDO;

  const supabase = createAdminClient();
  const cpf = onlyDigits(customer.cpf);

  // Upsert do cliente por CPF (cria ou atualiza com os dados mais recentes).
  const { data: customerRow, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        cpf,
        name: customer.nome,
        phone: customer.telefone,
        rua: customer.rua,
        numero: customer.numero,
        bairro: customer.bairro,
        complemento: customer.complemento,
        cidade: customer.cidade,
        uf: customer.uf,
        cep: customer.cep,
        observacao: customer.observacao,
      },
      { onConflict: "cpf" }
    )
    .select("id")
    .single();

  if (customerError || !customerRow) {
    throw new Error(customerError?.message ?? "Falha ao registrar o cliente.");
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerRow.id,
      customer_name: customer.nome,
      customer_cpf: cpf,
      customer_phone: customer.telefone,
      rua: customer.rua,
      numero: customer.numero,
      bairro: customer.bairro,
      complemento: customer.complemento,
      cidade: customer.cidade,
      uf: customer.uf,
      cep: customer.cep,
      observacao: customer.observacao,
      delivery_label: delivery?.label ?? null,
      delivery_price: frete,
      subtotal,
      frete,
      total,
      points,
    })
    .select("id, number")
    .single();

  if (orderError || !orderRow) {
    throw new Error(orderError?.message ?? "Falha ao registrar o pedido.");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: orderRow.id,
      product_id: item.productId,
      name: item.name,
      qty: item.qty,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
      is_wholesale: item.isWholesale,
    }))
  );

  if (itemsError) throw new Error(itemsError.message);

  return {
    id: String(orderRow.number),
    ref: orderRow.id,
    items: orderItems,
    customer,
    delivery: delivery
      ? { label: delivery.label, price: frete, eta: delivery.eta }
      : null,
    subtotal,
    frete,
    total,
    createdAtISO: new Date().toISOString(),
  };
}
