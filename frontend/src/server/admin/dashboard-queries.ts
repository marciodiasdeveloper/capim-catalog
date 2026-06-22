import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { roundMoney } from "@/lib/pricing";
import { BRAZIL_STATES } from "@/constants";
import type { OrderStatus } from "./order-queries";

/**
 * Queries de BI do /admin/dashboard. Cada função tem o guard
 * `if (!isSupabaseConfigured()) return <zeros/[]>` (igual ao padrão de
 * order-queries.ts) e agrega em memória sobre selects enxutos via service_role.
 *
 * NOTA: `orders` só tem `created_at` (sem `paid_at`). Métricas de "hoje"/mês e
 * reconhecimento de receita usam a data de CRIAÇÃO do pedido como proxy.
 */

// ---------------------------------------------------------------- date utils

function startOfMonth(ref: Date): Date {
  return new Date(ref.getFullYear(), ref.getMonth(), 1);
}
function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** Variação percentual; null quando a base anterior é zero (evita % falso). */
function pctDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return roundMoney(((current - previous) / previous) * 100);
}

// -------------------------------------------------------- open orders / SLA

export interface AgingBuckets {
  lt6h: number;
  h6to24: number;
  h24to48: number;
  gt48: number;
}

export interface OpenOrdersOverview {
  openCount: number;
  openValue: number;
  overdueCount: number;
  agingBuckets: AgingBuckets;
  paidTodayCount: number;
  paidTodayValue: number;
  monthByStatus: Record<OrderStatus, number>;
  conversionRateMonth: number;
}

const EMPTY_OPEN: OpenOrdersOverview = {
  openCount: 0,
  openValue: 0,
  overdueCount: 0,
  agingBuckets: { lt6h: 0, h6to24: 0, h24to48: 0, gt48: 0 },
  paidTodayCount: 0,
  paidTodayValue: 0,
  monthByStatus: { pending: 0, paid: 0, cancelled: 0 },
  conversionRateMonth: 0,
};

export async function getOpenOrdersOverview(): Promise<OpenOrdersOverview> {
  if (!isSupabaseConfigured()) return EMPTY_OPEN;

  const supabase = createAdminClient();
  const now = Date.now();
  const monthISO = startOfMonth(new Date()).toISOString();
  const todayMs = startOfToday().getTime();

  const [pendingRes, monthRes] = await Promise.all([
    supabase.from("orders").select("total, created_at").eq("status", "pending"),
    supabase
      .from("orders")
      .select("total, status, created_at")
      .gte("created_at", monthISO),
  ]);

  if (pendingRes.error) throw new Error(pendingRes.error.message);
  if (monthRes.error) throw new Error(monthRes.error.message);

  const aging: AgingBuckets = { lt6h: 0, h6to24: 0, h24to48: 0, gt48: 0 };
  let openValue = 0;
  for (const row of pendingRes.data ?? []) {
    openValue += Number(row.total);
    const hours = (now - new Date(row.created_at).getTime()) / 3_600_000;
    if (hours < 6) aging.lt6h += 1;
    else if (hours < 24) aging.h6to24 += 1;
    else if (hours < 48) aging.h24to48 += 1;
    else aging.gt48 += 1;
  }

  const monthByStatus: Record<OrderStatus, number> = {
    pending: 0,
    paid: 0,
    cancelled: 0,
  };
  let paidTodayCount = 0;
  let paidTodayValue = 0;
  for (const row of monthRes.data ?? []) {
    monthByStatus[row.status as OrderStatus] += 1;
    if (row.status === "paid" && new Date(row.created_at).getTime() >= todayMs) {
      paidTodayCount += 1;
      paidTodayValue += Number(row.total);
    }
  }

  const monthTotal =
    monthByStatus.pending + monthByStatus.paid + monthByStatus.cancelled;

  return {
    openCount: (pendingRes.data ?? []).length,
    openValue: roundMoney(openValue),
    overdueCount: aging.h24to48 + aging.gt48,
    agingBuckets: aging,
    paidTodayCount,
    paidTodayValue: roundMoney(paidTodayValue),
    monthByStatus,
    conversionRateMonth:
      monthTotal > 0
        ? roundMoney((monthByStatus.paid / monthTotal) * 100)
        : 0,
  };
}

// --------------------------------------------------------------- growth/MTD

export interface GrowthMetrics {
  faturamento: number;
  pedidos: number;
  itensVendidos: number;
  aov: number;
  pontos: number;
  descontoTotal: number;
  fretesGratisPct: number;
}

export interface GrowthSummary {
  current: GrowthMetrics;
  previous: GrowthMetrics;
  deltas: {
    faturamento: number | null;
    pedidos: number | null;
    aov: number | null;
    itensVendidos: number | null;
  };
}

interface PaidRow {
  total: number;
  frete: number;
  discount: number;
  points: number;
  created_at: string;
  order_items: { qty: number }[] | null;
}

function metricsFrom(rows: PaidRow[]): GrowthMetrics {
  let faturamento = 0;
  let itensVendidos = 0;
  let pontos = 0;
  let descontoTotal = 0;
  let fretesGratis = 0;
  for (const row of rows) {
    faturamento += Number(row.total);
    pontos += row.points;
    descontoTotal += Number(row.discount);
    if (Number(row.frete) === 0) fretesGratis += 1;
    for (const item of row.order_items ?? []) itensVendidos += item.qty;
  }
  const pedidos = rows.length;
  return {
    faturamento: roundMoney(faturamento),
    pedidos,
    itensVendidos,
    aov: pedidos > 0 ? roundMoney(faturamento / pedidos) : 0,
    pontos,
    descontoTotal: roundMoney(descontoTotal),
    fretesGratisPct: pedidos > 0 ? roundMoney((fretesGratis / pedidos) * 100) : 0,
  };
}

const EMPTY_METRICS: GrowthMetrics = {
  faturamento: 0,
  pedidos: 0,
  itensVendidos: 0,
  aov: 0,
  pontos: 0,
  descontoTotal: 0,
  fretesGratisPct: 0,
};

export async function getGrowthSummary(): Promise<GrowthSummary> {
  if (!isSupabaseConfigured()) {
    return {
      current: EMPTY_METRICS,
      previous: EMPTY_METRICS,
      deltas: { faturamento: null, pedidos: null, aov: null, itensVendidos: null },
    };
  }

  const supabase = createAdminClient();
  const now = new Date();
  const currentStart = startOfMonth(now);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // Mesmo nº de dias decorridos no mês anterior (comparação justa).
  const prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const { data, error } = await supabase
    .from("orders")
    .select("total, frete, discount, points, status, created_at, order_items(qty)")
    .eq("status", "paid")
    .gte("created_at", prevStart.toISOString());
  if (error) throw new Error(error.message);

  const currentStartMs = currentStart.getTime();
  const prevEndMs = prevEnd.getTime();
  const currentRows: PaidRow[] = [];
  const previousRows: PaidRow[] = [];
  for (const row of (data ?? []) as PaidRow[]) {
    const ts = new Date(row.created_at).getTime();
    if (ts >= currentStartMs) currentRows.push(row);
    else if (ts < prevEndMs) previousRows.push(row);
  }

  const current = metricsFrom(currentRows);
  const previous = metricsFrom(previousRows);
  return {
    current,
    previous,
    deltas: {
      faturamento: pctDelta(current.faturamento, previous.faturamento),
      pedidos: pctDelta(current.pedidos, previous.pedidos),
      aov: pctDelta(current.aov, previous.aov),
      itensVendidos: pctDelta(current.itensVendidos, previous.itensVendidos),
    },
  };
}

// --------------------------------------------------------------- daily trend

export interface DailyPoint {
  date: string;
  label: string;
  faturamento: number;
  pedidos: number;
}

export async function getDailyTrend(days = 30): Promise<DailyPoint[]> {
  const start = startOfToday();
  start.setDate(start.getDate() - (days - 1));

  // Esqueleto com todos os dias (preenche zeros nos dias sem venda).
  const skeleton = new Map<string, DailyPoint>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    skeleton.set(dateKey(d), {
      date: dateKey(d),
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      faturamento: 0,
      pedidos: 0,
    });
  }

  if (!isSupabaseConfigured()) return [...skeleton.values()];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("status", "paid")
    .gte("created_at", start.toISOString());
  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const key = dateKey(new Date(row.created_at));
    const point = skeleton.get(key);
    if (point) {
      point.faturamento = roundMoney(point.faturamento + Number(row.total));
      point.pedidos += 1;
    }
  }
  return [...skeleton.values()];
}

// ------------------------------------------------------- revenue by category

export interface CategoryRevenue {
  name: string;
  revenue: number;
}

export async function getRevenueByCategory(): Promise<CategoryRevenue[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const monthISO = startOfMonth(new Date()).toISOString();

  const [ordersRes, productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("orders")
      .select("status, created_at, order_items(product_id, line_total)")
      .eq("status", "paid")
      .gte("created_at", monthISO),
    supabase.from("products").select("id, category_id"),
    supabase.from("categories").select("id, name"),
  ]);
  if (ordersRes.error) throw new Error(ordersRes.error.message);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (categoriesRes.error) throw new Error(categoriesRes.error.message);

  const productCategory = new Map<string, string>();
  for (const p of productsRes.data ?? []) productCategory.set(p.id, p.category_id);
  const categoryName = new Map<string, string>();
  for (const c of categoriesRes.data ?? []) categoryName.set(c.id, c.name);

  const revenueByCategory = new Map<string, number>();
  for (const order of ordersRes.data ?? []) {
    const items = (order.order_items ?? []) as {
      product_id: string;
      line_total: number;
    }[];
    for (const item of items) {
      const categoryId = productCategory.get(item.product_id);
      const name = (categoryId && categoryName.get(categoryId)) || "Sem categoria";
      revenueByCategory.set(
        name,
        (revenueByCategory.get(name) ?? 0) + Number(item.line_total)
      );
    }
  }

  return [...revenueByCategory.entries()]
    .map(([name, revenue]) => ({ name, revenue: roundMoney(revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ------------------------------------------------------------- top products

export interface TopProduct {
  productId: string;
  name: string;
  qty: number;
  revenue: number;
}

export async function getTopProducts(limit = 8): Promise<TopProduct[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const monthISO = startOfMonth(new Date()).toISOString();
  const { data, error } = await supabase
    .from("orders")
    .select("status, created_at, order_items(product_id, name, qty, line_total)")
    .eq("status", "paid")
    .gte("created_at", monthISO);
  if (error) throw new Error(error.message);

  const byProduct = new Map<string, TopProduct>();
  for (const order of data ?? []) {
    const items = (order.order_items ?? []) as {
      product_id: string;
      name: string;
      qty: number;
      line_total: number;
    }[];
    for (const item of items) {
      const current =
        byProduct.get(item.product_id) ??
        { productId: item.product_id, name: item.name, qty: 0, revenue: 0 };
      current.qty += item.qty;
      current.revenue = roundMoney(current.revenue + Number(item.line_total));
      byProduct.set(item.product_id, current);
    }
  }

  return [...byProduct.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// --------------------------------------------------------------- coupon stats

export interface CouponUsage {
  code: string;
  count: number;
  desconto: number;
}

export interface CouponStats {
  descontoTotal: number;
  taxaDescontoPct: number;
  ordersWithCoupon: number;
  porCupom: CouponUsage[];
}

const EMPTY_COUPONS: CouponStats = {
  descontoTotal: 0,
  taxaDescontoPct: 0,
  ordersWithCoupon: 0,
  porCupom: [],
};

export async function getCouponStats(): Promise<CouponStats> {
  if (!isSupabaseConfigured()) return EMPTY_COUPONS;

  const supabase = createAdminClient();
  const monthISO = startOfMonth(new Date()).toISOString();
  const { data, error } = await supabase
    .from("orders")
    .select("subtotal, discount, coupon_code, status, created_at")
    .eq("status", "paid")
    .gte("created_at", monthISO);
  if (error) throw new Error(error.message);

  let descontoTotal = 0;
  let subtotalTotal = 0;
  let ordersWithCoupon = 0;
  const byCoupon = new Map<string, CouponUsage>();
  for (const row of data ?? []) {
    subtotalTotal += Number(row.subtotal);
    const discount = Number(row.discount);
    if (discount > 0) {
      descontoTotal += discount;
      ordersWithCoupon += 1;
      const code = row.coupon_code ?? "—";
      const current = byCoupon.get(code) ?? { code, count: 0, desconto: 0 };
      current.count += 1;
      current.desconto = roundMoney(current.desconto + discount);
      byCoupon.set(code, current);
    }
  }

  return {
    descontoTotal: roundMoney(descontoTotal),
    taxaDescontoPct:
      subtotalTotal > 0 ? roundMoney((descontoTotal / subtotalTotal) * 100) : 0,
    ordersWithCoupon,
    porCupom: [...byCoupon.values()].sort((a, b) => b.desconto - a.desconto),
  };
}

// ------------------------------------------------------------------ retention

export interface RetentionOverview {
  clientesPagantes: number;
  clientesNovosMes: number;
  clientesRecorrentes: number;
  taxaRecompra: number;
  ltvMedio: number;
  frequenciaMedia: number;
  pontosEmitidosMes: number;
  pedidosPagosMes: number;
}

const EMPTY_RETENTION: RetentionOverview = {
  clientesPagantes: 0,
  clientesNovosMes: 0,
  clientesRecorrentes: 0,
  taxaRecompra: 0,
  ltvMedio: 0,
  frequenciaMedia: 0,
  pontosEmitidosMes: 0,
  pedidosPagosMes: 0,
};

export async function getRetentionOverview(): Promise<RetentionOverview> {
  if (!isSupabaseConfigured()) return EMPTY_RETENTION;

  const supabase = createAdminClient();
  const monthISO = startOfMonth(new Date()).toISOString();
  const monthMs = startOfMonth(new Date()).getTime();

  const [ordersRes, newCustomersRes] = await Promise.all([
    supabase
      .from("orders")
      .select("customer_id, total, points, created_at")
      .eq("status", "paid"),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthISO),
  ]);
  if (ordersRes.error) throw new Error(ordersRes.error.message);
  if (newCustomersRes.error) throw new Error(newCustomersRes.error.message);

  const byCustomer = new Map<string, { orders: number; spent: number }>();
  let pedidosPagosTotal = 0;
  let pontosEmitidosMes = 0;
  let pedidosPagosMes = 0;
  for (const row of ordersRes.data ?? []) {
    if (new Date(row.created_at).getTime() >= monthMs) {
      pontosEmitidosMes += row.points;
      pedidosPagosMes += 1;
    }
    if (!row.customer_id) continue;
    pedidosPagosTotal += 1;
    const current = byCustomer.get(row.customer_id) ?? { orders: 0, spent: 0 };
    current.orders += 1;
    current.spent += Number(row.total);
    byCustomer.set(row.customer_id, current);
  }

  const clientesPagantes = byCustomer.size;
  let clientesRecorrentes = 0;
  let receitaTotal = 0;
  for (const c of byCustomer.values()) {
    if (c.orders >= 2) clientesRecorrentes += 1;
    receitaTotal += c.spent;
  }

  return {
    clientesPagantes,
    clientesNovosMes: newCustomersRes.count ?? 0,
    clientesRecorrentes,
    taxaRecompra:
      clientesPagantes > 0
        ? roundMoney((clientesRecorrentes / clientesPagantes) * 100)
        : 0,
    ltvMedio:
      clientesPagantes > 0 ? roundMoney(receitaTotal / clientesPagantes) : 0,
    frequenciaMedia:
      clientesPagantes > 0
        ? roundMoney(pedidosPagosTotal / clientesPagantes)
        : 0,
    pontosEmitidosMes,
    pedidosPagosMes,
  };
}

// ------------------------------------------------------- customers by state

export interface StateDistribution {
  uf: string;
  nome: string;
  clientes: number;
  pedidos: number;
}

const UF_NAME = new Map(BRAZIL_STATES.map((s) => [s.uf, s.name]));

export async function getCustomersByState(): Promise<StateDistribution[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const [customersRes, ordersRes] = await Promise.all([
    supabase.from("customers").select("uf"),
    supabase.from("orders").select("uf, status").eq("status", "paid"),
  ]);
  if (customersRes.error) throw new Error(customersRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const byUf = new Map<string, { clientes: number; pedidos: number }>();
  const bump = (uf: string | null, field: "clientes" | "pedidos") => {
    if (!uf) return;
    const key = uf.toUpperCase();
    const current = byUf.get(key) ?? { clientes: 0, pedidos: 0 };
    current[field] += 1;
    byUf.set(key, current);
  };
  for (const row of customersRes.data ?? []) bump(row.uf, "clientes");
  for (const row of ordersRes.data ?? []) bump(row.uf, "pedidos");

  return [...byUf.entries()]
    .map(([uf, v]) => ({ uf, nome: UF_NAME.get(uf) ?? uf, ...v }))
    .sort((a, b) => b.clientes - a.clientes || b.pedidos - a.pedidos);
}
