"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** "md" (padrão) ou "sm" (compacto, p/ áreas estreitas como o resumo). */
  size?: "md" | "sm";
  className?: string;
}

/** Seletor de quantidade "− N +" controlado. */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  size = "md",
  className,
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const buttonSize = size === "sm" ? "icon-xs" : "icon-sm";
  const inputWidth = size === "sm" ? "w-7" : "w-10";

  return (
    <div
      className={cn(
        "border-border bg-background/40 inline-flex items-center rounded-lg border",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
        className="active:scale-90"
      >
        <Minus />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Quantidade"
        className={cn(
          "[appearance:textfield] bg-transparent text-center font-mono text-sm tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          inputWidth
        )}
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          onChange(Number.isNaN(parsed) ? min : clamp(parsed));
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className="active:scale-90"
      >
        <Plus />
      </Button>
    </div>
  );
}
