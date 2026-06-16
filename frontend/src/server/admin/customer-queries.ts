import "server-only";

import type { CustomerRecord } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { mapCustomer, type CustomerRow } from "../row-mappers";
import type { OrderStatus } from "./order-queries";

export interface AdminCustomer extends CustomerRecord {
  ordersCount: number;
  totalSpent: number;
}

export interface CustomerOrderSummary {
  id: string;
  number: number;
  total: number;
  points: number;
  status: OrderStatus;
  createdAtISO: string;
}

/** Remove caracteres que quebrariam o filtro `.or()` do PostgREST. */
function sanitize(query: string): string {
  return query.replace(/[,()*%]/g, "").trim();
}

export async function getAdminCustomers(query?: string): Promise<AdminCustomer[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  let builder = supabase.from("customers").select("*").order("name");

  const q = query ? sanitize(query) : "";
  if (q) builder = builder.or(`name.ilike.%${q}%,cpf.ilike.%${q}%`);

  const { data, error } = await builder;
  if (error) throw new Error(`Erro ao carregar clientes: ${error.message}`);

  const customers = (data as CustomerRow[]).map(mapCustomer);
  if (customers.length === 0) return [];

  const ids = customers.map((c) => c.id);
  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select("customer_id, total, status")
    .in("customer_id", ids);
  if (ordersError) throw new Error(ordersError.message);

  const stats = new Map<string, { count: number; spent: number }>();
  for (const order of orderRows as {
    customer_id: string | null;
    total: number | string;
    status: OrderStatus;
  }[]) {
    if (!order.customer_id) continue;
    const current = stats.get(order.customer_id) ?? { count: 0, spent: 0 };
    current.count += 1;
    if (order.status === "paid") current.spent += Number(order.total);
    stats.set(order.customer_id, current);
  }

  return customers.map((customer) => ({
    ...customer,
    ordersCount: stats.get(customer.id)?.count ?? 0,
    totalSpent: stats.get(customer.id)?.spent ?? 0,
  }));
}

export async function getAdminCustomer(
  id: string
): Promise<CustomerRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCustomer(data as CustomerRow) : null;
}

export async function getCustomerOrders(
  customerId: string
): Promise<CustomerOrderSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, number, total, points, status, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    data as {
      id: string;
      number: number;
      total: number | string;
      points: number;
      status: OrderStatus;
      created_at: string;
    }[]
  ).map((row) => ({
    id: row.id,
    number: row.number,
    total: Number(row.total),
    points: row.points,
    status: row.status,
    createdAtISO: row.created_at,
  }));
}
