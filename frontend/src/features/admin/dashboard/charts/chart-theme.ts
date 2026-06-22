/** Tokens e estilos compartilhados pelos gráficos Recharts do dashboard. */

/** Paleta do tema (definida em globals.css como --chart-1..5). */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const AXIS_TICK = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
} as const;

export const tooltipContentStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--foreground)",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.15)",
} as const;

export const tooltipItemStyle = { color: "var(--foreground)" } as const;
export const tooltipLabelStyle = { color: "var(--muted-foreground)" } as const;

/** R$ compacto p/ eixos (ex.: 3200 → "R$ 3,2k"). */
export function brlCompact(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return `R$ ${Math.round(value)}`;
}
