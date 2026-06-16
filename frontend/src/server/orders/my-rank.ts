"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { aggregateMonthlyOrders } from "./ranking";

export interface MyRank {
  position: number;
  pontos: number;
  pedidos: number;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Posição do cliente no ranking do mês a partir da REFERÊNCIA (UUID) de um
 * pedido que ele realmente fez (salva localmente após finalizar). O UUID é
 * inadivinhável, então não dá para enumerar clientes por CPF. Retorna só os
 * dados do próprio cliente.
 */
export async function getMyMonthlyRank(
  orderRef: string
): Promise<MyRank | null> {
  if (!isSupabaseConfigured()) return null;
  if (!UUID_RE.test(orderRef)) return null;

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("id", orderRef)
    .maybeSingle();
  if (error || !order?.customer_id) return null;

  const aggregated = await aggregateMonthlyOrders();
  const index = aggregated.findIndex(
    (user) => user.customerId === order.customer_id
  );
  if (index < 0) return null;

  const me = aggregated[index];
  return { position: index + 1, pontos: me.pontos, pedidos: me.pedidos };
}
