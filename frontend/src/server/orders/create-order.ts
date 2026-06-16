"use server";

import { z } from "zod";

import { headers } from "next/headers";

import type { Order } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProducts } from "@/server/catalog";
import { getCouponByCode } from "@/server/coupons";
import { computeOrder } from "@/lib/pricing";
import { onlyDigits } from "@/lib/format";
import { rateLimit } from "./rate-limit";

// Limites de tamanho protegem este endpoint público (não autenticado) contra
// abuso/bloat: nenhuma string ilimitada, nº de itens e quantidades com teto.
const inputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().max(100),
        qty: z.coerce.number().int().min(1).max(9999),
      })
    )
    .min(1)
    .max(200),
  customer: z.object({
    nome: z.string().trim().min(1).max(120),
    cpf: z.string().max(20),
    telefone: z.string().max(30).default(""),
    rua: z.string().max(200).default(""),
    numero: z.string().max(20).default(""),
    bairro: z.string().max(120).default(""),
    complemento: z.string().max(120).default(""),
    cidade: z.string().max(120).default(""),
    cep: z.string().max(12).default(""),
    uf: z.string().max(2).default(""),
    observacao: z.string().max(1000).default(""),
  }),
  deliveryId: z.string().max(40).default(""),
  couponCode: z.string().max(40).optional(),
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

  // Rate limit por IP (resiliente fora de contexto de request, ex.: testes).
  let ip = "anon";
  try {
    ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  } catch {
    /* sem contexto de request */
  }
  if (!rateLimit(`order:${ip}`)) {
    throw new Error("Muitas tentativas em pouco tempo. Aguarde alguns instantes.");
  }

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) throw new Error("Pedido inválido.");
  const { items, customer, deliveryId, couponCode } = parsed.data;

  // CPF é a chave do cliente: exige 11 dígitos (evita colapsar clientes em cpf "").
  if (onlyDigits(customer.cpf).length !== 11) {
    throw new Error("CPF inválido.");
  }

  // Busca o cupom (se houver) para re-avaliação autoritativa no servidor.
  const fetchedCoupon = couponCode
    ? await getCouponByCode(couponCode)
    : null;

  // Recalcula TODO o pedido a partir dos preços reais do banco (fonte única,
  // compartilhada com o cliente via computeOrder). Nunca confia no cliente —
  // inclusive o desconto do cupom é re-avaliado aqui.
  const products = await getProducts();
  const {
    orderItems,
    subtotal,
    discount,
    coupon: appliedCoupon,
    delivery,
    frete,
    total,
    points,
  } = computeOrder(
    products,
    items,
    customer.uf,
    deliveryId,
    fetchedCoupon,
    new Date().toISOString()
  );

  if (orderItems.length === 0) throw new Error("Nenhum produto válido no pedido.");

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
      discount,
      coupon_code: appliedCoupon?.code ?? null,
      frete,
      total,
      points,
    })
    .select("id, number")
    .single();

  if (orderError || !orderRow) {
    throw new Error(orderError?.message ?? "Falha ao registrar o pedido.");
  }

  // Contabiliza o uso do cupom (best-effort; não derruba o pedido se falhar).
  if (appliedCoupon && fetchedCoupon) {
    await supabase
      .from("coupons")
      .update({ current_uses: fetchedCoupon.currentUses + 1 })
      .eq("id", fetchedCoupon.id);
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
    delivery,
    subtotal,
    discount,
    couponCode: appliedCoupon?.code ?? null,
    frete,
    total,
    points,
    createdAtISO: new Date().toISOString(),
  };
}
