import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EMPHASIS: Record<string, string> = {
  default: "",
  warning: "text-warning",
  destructive: "text-destructive",
  success: "text-success",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  /** Variação % vs período anterior; `null`/omitido = sem base p/ comparar. */
  delta?: number | null;
  hint?: string;
  emphasis?: "default" | "warning" | "destructive" | "success";
}

/** Card compacto de KPI: rótulo, valor grande, ícone e variação opcional. */
export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  emphasis = "default",
}: StatCardProps) {
  return (
    <Card size="sm" className="gap-2">
      <div className="flex items-center justify-between gap-2 px-(--card-spacing)">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        {icon ? (
          <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        ) : null}
      </div>
      <div className="space-y-0.5 px-(--card-spacing)">
        <div className={cn("text-2xl font-bold tabular-nums", EMPHASIS[emphasis])}>
          {value}
        </div>
        {delta != null || hint ? (
          <div className="flex items-center gap-1.5 text-xs">
            {delta != null ? <DeltaPill value={delta} /> : null}
            {hint ? <span className="text-muted-foreground">{hint}</span> : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function DeltaPill({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular-nums",
        up ? "text-success" : "text-destructive"
      )}
    >
      <Icon className="size-3" />
      {Math.abs(value).toFixed(1).replace(".", ",")}%
    </span>
  );
}
