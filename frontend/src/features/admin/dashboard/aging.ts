/** Classificação de idade (aging) de um pedido em aberto. Função pura/testável. */

export type AgingLevel = "fresh" | "warning" | "overdue";

export interface AgingMeta {
  level: AgingLevel;
  label: string;
  className: string;
}

/**
 * Idade desde a CRIAÇÃO do pedido (orders não tem paid_at):
 * `<6h` fresco, `6–24h` aviso, `>24h` atrasado.
 */
export function classifyAging(
  createdAtISO: string,
  nowMs: number = Date.now()
): AgingLevel {
  const hours = (nowMs - new Date(createdAtISO).getTime()) / 3_600_000;
  if (hours < 6) return "fresh";
  if (hours < 24) return "warning";
  return "overdue";
}

export const AGING_META: Record<AgingLevel, Omit<AgingMeta, "level">> = {
  fresh: { label: "Novo", className: "text-muted-foreground" },
  warning: { label: "Aguardando", className: "text-warning" },
  overdue: { label: "Atrasado", className: "text-destructive" },
};
