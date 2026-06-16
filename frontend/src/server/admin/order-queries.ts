import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface AdminOrderItem {
  name: string;
  qty: number;
}

export interface AdminOrder {
  id: string;
  number: number;
  customerName: string;
  customerPhone: string | null;
  cidade: string;
  total: number;
  points: number;
  status: OrderStatus;
  createdAtISO: string;
  items: AdminOrderItem[];
}

interface OrderRow {
  id: string;
  number: number;
  customer_name: string;
  customer_phone: string | null;
  cidade: string | null;
  uf: string | null;
  total: number | string;
  points: number;
  status: OrderStatus;
  created_at: string;
  order_items: AdminOrderItem[] | null;
}

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export interface OrderFilters {
  status?: OrderStatus;
  /** Limita ao mês corrente. */
  month?: boolean;
}

export async function getAdminOrders(
  filters: OrderFilters = {}
): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  let builder = supabase
    .from("orders")
    .select(
      "id, number, customer_name, customer_phone, cidade, uf, total, points, status, created_at, order_items(name, qty)"
    )
    .order("created_at", { ascending: false });

  if (filters.status) builder = builder.eq("status", filters.status);
  if (filters.month) builder = builder.gte("created_at", startOfMonthISO());

  const { data, error } = await builder;
  if (error) throw new Error(`Erro ao carregar pedidos: ${error.message}`);

  return (data as OrderRow[]).map((row) => ({
    id: row.id,
    number: row.number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    cidade: [row.cidade, row.uf].filter(Boolean).join(" / "),
    total: Number(row.total),
    points: row.points,
    status: row.status,
    createdAtISO: row.created_at,
    items: row.order_items ?? [],
  }));
}

export interface AdminOrderDetailItem {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  isWholesale: boolean;
}

export interface AdminOrderDetail {
  id: string;
  number: number;
  customerId: string | null;
  customerName: string;
  customerCpf: string;
  customerPhone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  observacao: string | null;
  deliveryLabel: string | null;
  subtotal: number;
  frete: number;
  total: number;
  points: number;
  status: OrderStatus;
  createdAtISO: string;
  items: AdminOrderDetailItem[];
}

interface OrderDetailRow {
  id: string;
  number: number;
  customer_id: string | null;
  customer_name: string;
  customer_cpf: string;
  customer_phone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  observacao: string | null;
  delivery_label: string | null;
  delivery_price: number | string;
  subtotal: number | string;
  frete: number | string;
  total: number | string;
  points: number;
  status: OrderStatus;
  created_at: string;
  order_items:
    | {
        name: string;
        qty: number;
        unit_price: number | string;
        line_total: number | string;
        is_wholesale: boolean;
      }[]
    | null;
}

export async function getAdminOrder(
  id: string
): Promise<AdminOrderDetail | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(name, qty, unit_price, line_total, is_wholesale)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as OrderDetailRow;
  return {
    id: row.id,
    number: row.number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerCpf: row.customer_cpf,
    customerPhone: row.customer_phone,
    rua: row.rua,
    numero: row.numero,
    bairro: row.bairro,
    complemento: row.complemento,
    cidade: row.cidade,
    uf: row.uf,
    cep: row.cep,
    observacao: row.observacao,
    deliveryLabel: row.delivery_label,
    subtotal: Number(row.subtotal),
    frete: Number(row.frete),
    total: Number(row.total),
    points: row.points,
    status: row.status,
    createdAtISO: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      name: item.name,
      qty: item.qty,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
      isWholesale: item.is_wholesale,
    })),
  };
}
