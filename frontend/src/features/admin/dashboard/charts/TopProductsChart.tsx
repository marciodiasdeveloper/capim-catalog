"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TopProduct } from "@/server/admin/dashboard-queries";
import { formatBRL, formatInt } from "@/lib/format";
import {
  AXIS_TICK,
  brlCompact,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chart-theme";

/** Top produtos por receita no mês (barras horizontais). */
export function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
        >
          <XAxis
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => brlCompact(Number(v))}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value, _name, item) => {
              const qty = (item?.payload as TopProduct | undefined)?.qty;
              return [
                `${formatBRL(Number(value))}${qty != null ? ` · ${formatInt(qty)} un` : ""}`,
                "Receita",
              ];
            }}
          />
          <Bar
            dataKey="revenue"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
