import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getRankedUsers, type RankedUser } from "@/data/ranking";

interface JoinedCustomer {
  name: string;
  cidade: string | null;
  uf: string | null;
  cpf: string;
}

interface OrderRankRow {
  customer_id: string | null;
  points: number;
  customers: JoinedCustomer | JoinedCustomer[] | null;
}

export interface AggregatedCustomer {
  customerId: string;
  cpf: string;
  name: string;
  cidade: string;
  pedidos: number;
  pontos: number;
}

/** Paleta de cores de avatar (sem expor dados do cliente). */
const AVATAR_COLORS = [
  "#f59e0b", "#3b82f6", "#a855f7", "#22c55e", "#06b6d4",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#ef4444",
];

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * Agrega pedidos PAGOS do mês corrente por CPF (server-only — inclui o CPF,
 * que NÃO deve ser exposto ao cliente). Ordenado por pontos desc.
 */
export async function aggregateMonthlyOrders(): Promise<AggregatedCustomer[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("points, customer_id, customers(name, cidade, uf, cpf)")
    .gte("created_at", startOfMonthISO())
    .eq("status", "paid");

  if (error) throw new Error(`Erro ao carregar ranking: ${error.message}`);

  const byCustomer = new Map<string, AggregatedCustomer>();
  for (const row of data as OrderRankRow[]) {
    const customer = Array.isArray(row.customers)
      ? row.customers[0]
      : row.customers;
    if (!row.customer_id || !customer) continue;

    const current = byCustomer.get(row.customer_id) ?? {
      customerId: row.customer_id,
      cpf: customer.cpf,
      name: customer.name,
      cidade: [customer.cidade, customer.uf].filter(Boolean).join(" / "),
      pedidos: 0,
      pontos: 0,
    };
    current.pedidos += 1;
    current.pontos += row.points;
    byCustomer.set(row.customer_id, current);
  }

  return [...byCustomer.values()].sort((a, b) => b.pontos - a.pontos);
}

/**
 * Ranking do mês com dados seguros (sem CPF/endereço). Sem Supabase, usa o mock.
 */
export async function getMonthlyRanking(): Promise<RankedUser[]> {
  if (!isSupabaseConfigured()) return getRankedUsers();

  try {
    const aggregated = await aggregateMonthlyOrders();
    return aggregated.map((user, index) => ({
      id: `rank-${index + 1}`,
      name: user.name,
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      cidade: user.cidade,
      pedidos: user.pedidos,
      pontos: user.pontos,
      position: index + 1,
      isCurrent: false,
    }));
  } catch (error) {
    // Ranking é secundário: nunca deve derrubar o catálogo.
    console.error("Falha ao carregar ranking:", error);
    return [];
  }
}
