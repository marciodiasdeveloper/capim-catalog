import type { FunnelStage } from "@/lib/analytics/funnel";
import { formatInt } from "@/lib/format";
import { CHART_COLORS } from "./chart-theme";

/**
 * Funil de conversão em CSS (barras proporcionais ao topo). Cada estágio mostra
 * o valor absoluto e, entre parênteses, a conversão em relação ao anterior.
 */
export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  return (
    <ul className="space-y-3">
      {stages.map((stage, i) => (
        <li key={stage.key} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{stage.label}</span>
            <span className="font-medium tabular-nums">
              {formatInt(stage.value)}
              {i > 0 && stage.stepPct != null ? (
                <span className="text-muted-foreground ml-1.5 font-normal">
                  ({stage.stepPct.toFixed(0)}%)
                </span>
              ) : null}
            </span>
          </div>
          <div className="bg-muted h-2.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stage.value > 0 ? Math.max(stage.pctOfTop, 3) : 0}%`,
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
