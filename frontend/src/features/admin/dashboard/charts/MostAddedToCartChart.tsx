"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AddedToCartProduct } from "@/server/admin/dashboard-queries";
import { formatInt } from "@/lib/format";
import {
  AXIS_TICK,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chart-theme";

/** Produtos mais adicionados ao carrinho no mês (barras horizontais). */
export function MostAddedToCartChart({ data }: { data: AddedToCartProduct[] }) {
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
            allowDecimals={false}
            tickFormatter={(v) => formatInt(Number(v))}
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
              const p = item?.payload as AddedToCartProduct | undefined;
              const conv =
                p?.conversion != null
                  ? ` · ${p.conversion.toFixed(0)}% vira venda`
                  : "";
              return [`${formatInt(Number(value))} adições${conv}`, "Carrinho"];
            }}
          />
          <Bar
            dataKey="addCount"
            fill="var(--chart-3)"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
