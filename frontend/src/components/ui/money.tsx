import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";

interface MoneyProps {
  value: number;
  className?: string;
}

/** Valor monetário em BRL, com fonte mono e numerais tabulares. */
export function Money({ value, className }: MoneyProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatBRL(value)}
    </span>
  );
}
