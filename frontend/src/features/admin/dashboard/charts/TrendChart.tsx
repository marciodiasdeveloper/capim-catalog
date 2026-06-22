"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyPoint } from "@/server/admin/dashboard-queries";
import { formatBRL, formatInt } from "@/lib/format";
import {
  AXIS_TICK,
  brlCompact,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chart-theme";
import { cn } from "@/lib/utils";

type Metric = "faturamento" | "pedidos";

/** Tendência diária (faturamento/pedidos pagos) com alternância. */
export function TrendChart({ data }: { data: DailyPoint[] }) {
  const [metric, setMetric] = useState<Metric>("faturamento");
  const isMoney = metric === "faturamento";

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(["faturamento", "pedidos"] as Metric[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              metric === m
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {m === "faturamento" ? "Faturamento" : "Pedidos"}
          </button>
        ))}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v) => (isMoney ? brlCompact(Number(v)) : formatInt(Number(v)))}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(value) =>
                isMoney
                  ? [formatBRL(Number(value)), "Faturamento"]
                  : [formatInt(Number(value)), "Pedidos"]
              }
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
