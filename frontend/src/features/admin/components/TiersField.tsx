"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import type { PriceTier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Editor de faixas de atacado. Mantém o estado e serializa em um input hidden
 * (`name="tiers"`) para ser enviado pela Server Action.
 */
export function TiersField({ defaultTiers }: { defaultTiers?: PriceTier[] }) {
  const [tiers, setTiers] = useState<PriceTier[]>(defaultTiers ?? []);

  function update(index: number, patch: Partial<PriceTier>) {
    setTiers((current) =>
      current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier))
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs">
        Faixas de atacado (opcional)
      </Label>
      <input type="hidden" name="tiers" value={JSON.stringify(tiers)} />

      {tiers.map((tier, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={tier.minQty}
            onChange={(e) => update(index, { minQty: Number(e.target.value) })}
            className="w-24"
            aria-label="Quantidade mínima"
          />
          <span className="text-muted-foreground text-xs">un+ →</span>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={tier.price}
            onChange={(e) => update(index, { price: Number(e.target.value) })}
            className="w-28"
            aria-label="Preço da faixa"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setTiers((current) => current.filter((_, i) => i !== index))
            }
            aria-label="Remover faixa"
          >
            <X />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setTiers((current) => [...current, { minQty: 5, price: 0 }])}
      >
        <Plus /> Adicionar faixa
      </Button>
    </div>
  );
}
