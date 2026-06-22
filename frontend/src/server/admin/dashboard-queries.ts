import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { roundMoney } from "@/lib/pricing";
import {
  buildFunnel,
  overallConversion,
  type FunnelStage,
} from "@/lib/analytics/funnel";
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

/**
 * true quando o erro do PostgREST é "tabela ainda não existe" (migration
 * pendente). Permite que as queries de analytics degradem para vazio em vez de
 * derrubar o dashboard antes de a migration 0007 ser aplicada.
 */
function isMissingTable(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /Could not find the table/i.test(error.message ?? "")
  );
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

// ================================================================
//  TRÁFEGO & COMPORTAMENTO (tabela analytics_events)
// ================================================================
//
// Eventos anônimos por sessão. "Visitas" = sessões distintas (page_view).
// Tudo degrada para zeros/[] sem Supabase, igual às queries de pedidos.

// ----------------------------------------------------------- traffic overview

export interface TrafficOverview {
  visitsToday: number;
  pageViewsToday: number;
  visitsMonth: number;
  pageViewsMonth: number;
  deltas: { visits: number | null; pageViews: number | null };
}

const EMPTY_TRAFFIC: TrafficOverview = {
  visitsToday: 0,
  pageViewsToday: 0,
  visitsMonth: 0,
  pageViewsMonth: 0,
  deltas: { visits: null, pageViews: null },
};

export async function getTrafficOverview(): Promise<TrafficOverview> {
  if (!isSupabaseConfigured()) return EMPTY_TRAFFIC;

  const supabase = createAdminClient();
  const now = new Date();
  const currentStartMs = startOfMonth(now).getTime();
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // Mesmo nº de dias decorridos no mês anterior (comparação justa).
  const prevEndMs = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  ).getTime();
  const todayMs = startOfToday().getTime();

  const { data, error } = await supabase
    .from("analytics_events")
    .select("session_id, created_at")
    .eq("type", "page_view")
    .gte("created_at", prevStart.toISOString());
  if (error) {
    if (isMissingTable(error)) return EMPTY_TRAFFIC;
    throw new Error(error.message);
  }

  let pageViewsToday = 0;
  let pageViewsMonth = 0;
  let pageViewsPrev = 0;
  const sessToday = new Set<string>();
  const sessMonth = new Set<string>();
  const sessPrev = new Set<string>();
  for (const row of data ?? []) {
    const ts = new Date(row.created_at).getTime();
    if (ts >= currentStartMs) {
      pageViewsMonth += 1;
      sessMonth.add(row.session_id);
      if (ts >= todayMs) {
        pageViewsToday += 1;
        sessToday.add(row.session_id);
      }
    } else if (ts < prevEndMs) {
      pageViewsPrev += 1;
      sessPrev.add(row.session_id);
    }
  }

  return {
    visitsToday: sessToday.size,
    pageViewsToday,
    visitsMonth: sessMonth.size,
    pageViewsMonth,
    deltas: {
      visits: pctDelta(sessMonth.size, sessPrev.size),
      pageViews: pctDelta(pageViewsMonth, pageViewsPrev),
    },
  };
}

// -------------------------------------------------------------- traffic trend

export interface TrafficPoint {
  date: string;
  label: string;
  visits: number;
  pageViews: number;
}

export async function getTrafficTrend(days = 30): Promise<TrafficPoint[]> {
  const start = startOfToday();
  start.setDate(start.getDate() - (days - 1));

  const skeleton = new Map<string, TrafficPoint>();
  const sessionsByDay = new Map<string, Set<string>>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateKey(d);
    skeleton.set(key, {
      date: key,
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      visits: 0,
      pageViews: 0,
    });
    sessionsByDay.set(key, new Set());
  }

  if (!isSupabaseConfigured()) return [...skeleton.values()];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("session_id, created_at")
    .eq("type", "page_view")
    .gte("created_at", start.toISOString());
  if (error) {
    if (isMissingTable(error)) return [...skeleton.values()];
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const key = dateKey(new Date(row.created_at));
    const point = skeleton.get(key);
    const sessions = sessionsByDay.get(key);
    if (point && sessions) {
      point.pageViews += 1;
      sessions.add(row.session_id);
    }
  }
  for (const [key, sessions] of sessionsByDay) {
    const point = skeleton.get(key);
    if (point) point.visits = sessions.size;
  }
  return [...skeleton.values()];
}

// ----------------------------------------------------------- most added to cart

export interface AddedToCartProduct {
  productId: string;
  name: string;
  /** Nº de eventos de adição ao carrinho. */
  addCount: number;
  /** Soma das quantidades adicionadas. */
  qtyAdded: number;
  /** Unidades efetivamente vendidas (pagas) no mês. */
  ordered: number;
  /** Conversão: ordered / qtyAdded × 100 (null se nada foi adicionado). */
  conversion: number | null;
}

export async function getMostAddedToCart(
  limit = 8
): Promise<AddedToCartProduct[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const monthISO = startOfMonth(new Date()).toISOString();

  const [eventsRes, productsRes, ordersRes] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("product_id, qty")
      .eq("type", "add_to_cart")
      .gte("created_at", monthISO),
    supabase.from("products").select("id, name"),
    supabase
      .from("orders")
      .select("status, created_at, order_items(product_id, qty)")
      .eq("status", "paid")
      .gte("created_at", monthISO),
  ]);
  if (eventsRes.error) {
    if (isMissingTable(eventsRes.error)) return [];
    throw new Error(eventsRes.error.message);
  }
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const productName = new Map<string, string>();
  for (const p of productsRes.data ?? []) productName.set(p.id, p.name);

  const orderedByProduct = new Map<string, number>();
  for (const order of ordersRes.data ?? []) {
    const items = (order.order_items ?? []) as {
      product_id: string;
      qty: number;
    }[];
    for (const item of items) {
      orderedByProduct.set(
        item.product_id,
        (orderedByProduct.get(item.product_id) ?? 0) + item.qty
      );
    }
  }

  const byProduct = new Map<string, { addCount: number; qtyAdded: number }>();
  for (const row of eventsRes.data ?? []) {
    if (!row.product_id) continue;
    const current = byProduct.get(row.product_id) ?? { addCount: 0, qtyAdded: 0 };
    current.addCount += 1;
    current.qtyAdded += Number(row.qty ?? 0);
    byProduct.set(row.product_id, current);
  }

  return [...byProduct.entries()]
    .map(([productId, agg]) => {
      const ordered = orderedByProduct.get(productId) ?? 0;
      return {
        productId,
        name: productName.get(productId) ?? "Produto removido",
        addCount: agg.addCount,
        qtyAdded: agg.qtyAdded,
        ordered,
        conversion:
          agg.qtyAdded > 0 ? roundMoney((ordered / agg.qtyAdded) * 100) : null,
      };
    })
    .sort((a, b) => b.addCount - a.addCount)
    .slice(0, limit);
}

// ----------------------------------------------------------- conversion funnel

export interface ConversionFunnel {
  stages: FunnelStage[];
  /** Conversão geral visita → pedido pago (%). */
  overall: number;
}

const FUNNEL_LABELS = [
  { key: "visitas", label: "Visitas" },
  { key: "carrinho", label: "Add. carrinho" },
  { key: "checkout", label: "Checkout" },
  { key: "pago", label: "Pedido pago" },
] as const;

function funnelFrom(values: [number, number, number, number]): ConversionFunnel {
  const raw = FUNNEL_LABELS.map((l, i) => ({ ...l, value: values[i] }));
  return { stages: buildFunnel(raw), overall: overallConversion(raw) };
}

export async function getConversionFunnel(): Promise<ConversionFunnel> {
  if (!isSupabaseConfigured()) return funnelFrom([0, 0, 0, 0]);

  const supabase = createAdminClient();
  const monthISO = startOfMonth(new Date()).toISOString();

  const [eventsRes, ordersRes] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("type, session_id")
      .gte("created_at", monthISO)
      .in("type", ["page_view", "add_to_cart", "begin_checkout"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid")
      .gte("created_at", monthISO),
  ]);
  if (eventsRes.error) {
    if (isMissingTable(eventsRes.error)) {
      return funnelFrom([0, 0, 0, ordersRes.count ?? 0]);
    }
    throw new Error(eventsRes.error.message);
  }
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const visitas = new Set<string>();
  const carrinho = new Set<string>();
  const checkout = new Set<string>();
  for (const row of eventsRes.data ?? []) {
    if (row.type === "page_view") visitas.add(row.session_id);
    else if (row.type === "add_to_cart") carrinho.add(row.session_id);
    else if (row.type === "begin_checkout") checkout.add(row.session_id);
  }

  return funnelFrom([
    visitas.size,
    carrinho.size,
    checkout.size,
    ordersRes.count ?? 0,
  ]);
}

// ================================================================
//  INSIGHTS DERIVADOS DOS PEDIDOS (sem rastreamento novo)
// ================================================================

// ---------------------------------------------------- heatmap dia × hora

export interface OrdersHeatmap {
  /** grid[weekday 0=Dom..6=Sáb][hour 0..23] = nº de pedidos pagos. */
  grid: number[][];
  max: number;
  total: number;
  peakWeekday: number;
  peakHour: number;
}

function emptyHeatmap(): OrdersHeatmap {
  return {
    grid: Array.from({ length: 7 }, () => new Array<number>(24).fill(0)),
    max: 0,
    total: 0,
    peakWeekday: 0,
    peakHour: 0,
  };
}

export async function getOrdersHeatmap(): Promise<OrdersHeatmap> {
  const result = emptyHeatmap();
  if (!isSupabaseConfigured()) return result;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("created_at")
    .eq("status", "paid");
  if (error) throw new Error(error.message);

  // Horário em America/Sao_Paulo (UTC−3) — o resto do dashboard usa hora do
  // servidor, mas para "horário de pico" o fuso local importa.
  for (const row of data ?? []) {
    const local = new Date(new Date(row.created_at).getTime() - 3 * 3_600_000);
    const weekday = local.getUTCDay();
    const hour = local.getUTCHours();
    result.grid[weekday][hour] += 1;
    result.total += 1;
    if (result.grid[weekday][hour] > result.max) {
      result.max = result.grid[weekday][hour];
      result.peakWeekday = weekday;
      result.peakHour = hour;
    }
  }
  return result;
}

// ----------------------------------------------------- atacado vs varejo

export interface WholesaleMix {
  wholesaleRevenue: number;
  retailRevenue: number;
  wholesalePct: number;
  wholesaleUnits: number;
  retailUnits: number;
}

const EMPTY_WHOLESALE: WholesaleMix = {
  wholesaleRevenue: 0,
  retailRevenue: 0,
  wholesalePct: 0,
  wholesaleUnits: 0,
  retailUnits: 0,
};

export async function getWholesaleMix(): Promise<WholesaleMix> {
  if (!isSupabaseConfigured()) return EMPTY_WHOLESALE;

  const supabase = createAdminClient();
  const monthISO = startOfMonth(new Date()).toISOString();
  const { data, error } = await supabase
    .from("orders")
    .select("status, created_at, order_items(qty, line_total, is_wholesale)")
    .eq("status", "paid")
    .gte("created_at", monthISO);
  if (error) throw new Error(error.message);

  let wholesaleRevenue = 0;
  let retailRevenue = 0;
  let wholesaleUnits = 0;
  let retailUnits = 0;
  for (const order of data ?? []) {
    const items = (order.order_items ?? []) as {
      qty: number;
      line_total: number;
      is_wholesale: boolean;
    }[];
    for (const item of items) {
      if (item.is_wholesale) {
        wholesaleRevenue += Number(item.line_total);
        wholesaleUnits += item.qty;
      } else {
        retailRevenue += Number(item.line_total);
        retailUnits += item.qty;
      }
    }
  }

  const total = wholesaleRevenue + retailRevenue;
  return {
    wholesaleRevenue: roundMoney(wholesaleRevenue),
    retailRevenue: roundMoney(retailRevenue),
    wholesalePct: total > 0 ? roundMoney((wholesaleRevenue / total) * 100) : 0,
    wholesaleUnits,
    retailUnits,
  };
}

// ------------------------------------------------- cobertura do catálogo

export interface CatalogCoverage {
  totalActive: number;
  soldCount: number;
  zeroSalesCount: number;
  /** Amostra de produtos ativos sem vendas recentes (até 12). */
  zeroSales: { id: string; name: string }[];
}

const EMPTY_COVERAGE: CatalogCoverage = {
  totalActive: 0,
  soldCount: 0,
  zeroSalesCount: 0,
  zeroSales: [],
};

export async function getCatalogCoverage(days = 90): Promise<CatalogCoverage> {
  if (!isSupabaseConfigured()) return EMPTY_COVERAGE;

  const supabase = createAdminClient();
  const since = startOfToday();
  since.setDate(since.getDate() - days);

  const [productsRes, ordersRes] = await Promise.all([
    supabase.from("products").select("id, name").eq("active", true),
    supabase
      .from("orders")
      .select("status, created_at, order_items(product_id)")
      .eq("status", "paid")
      .gte("created_at", since.toISOString()),
  ]);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const sold = new Set<string>();
  for (const order of ordersRes.data ?? []) {
    const items = (order.order_items ?? []) as { product_id: string }[];
    for (const item of items) sold.add(item.product_id);
  }

  const active = productsRes.data ?? [];
  const zeroSales = active.filter((p) => !sold.has(p.id));
  const soldCount = active.length - zeroSales.length;

  return {
    totalActive: active.length,
    soldCount,
    zeroSalesCount: zeroSales.length,
    zeroSales: zeroSales.slice(0, 12).map((p) => ({ id: p.id, name: p.name })),
  };
}

// ------------------------------------------------- recuperação de pendentes

export interface PendingRecovery {
  recoverableValue: number;
  recoverableCount: number;
  agingValue: { lt6h: number; h6to24: number; h24to48: number; gt48: number };
}

const EMPTY_RECOVERY: PendingRecovery = {
  recoverableValue: 0,
  recoverableCount: 0,
  agingValue: { lt6h: 0, h6to24: 0, h24to48: 0, gt48: 0 },
};

export async function getPendingRecovery(): Promise<PendingRecovery> {
  if (!isSupabaseConfigured()) return EMPTY_RECOVERY;

  const supabase = createAdminClient();
  const now = Date.now();
  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("status", "pending");
  if (error) throw new Error(error.message);

  const agingValue = { lt6h: 0, h6to24: 0, h24to48: 0, gt48: 0 };
  let recoverableValue = 0;
  for (const row of data ?? []) {
    const total = Number(row.total);
    recoverableValue += total;
    const hours = (now - new Date(row.created_at).getTime()) / 3_600_000;
    if (hours < 6) agingValue.lt6h += total;
    else if (hours < 24) agingValue.h6to24 += total;
    else if (hours < 48) agingValue.h24to48 += total;
    else agingValue.gt48 += total;
  }

  return {
    recoverableValue: roundMoney(recoverableValue),
    recoverableCount: (data ?? []).length,
    agingValue: {
      lt6h: roundMoney(agingValue.lt6h),
      h6to24: roundMoney(agingValue.h6to24),
      h24to48: roundMoney(agingValue.h24to48),
      gt48: roundMoney(agingValue.gt48),
    },
  };
}
