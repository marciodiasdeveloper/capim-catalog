"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatInt } from "@/lib/format";
import {
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chart-theme";

/** Donut novos (1 pedido pago) vs recorrentes (2+). */
export function NewVsReturningChart({
  novos,
  recorrentes,
}: {
  novos: number;
  recorrentes: number;
}) {
  const data = [
    { name: "Novos", value: novos, fill: "var(--chart-3)" },
    { name: "Recorrentes", value: recorrentes, fill: "var(--chart-2)" },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} stroke="var(--card)" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value, name) => [formatInt(Number(value)), String(name)]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value) => (
              <span className="text-muted-foreground text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
