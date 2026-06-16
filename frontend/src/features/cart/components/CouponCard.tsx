"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Tag, X } from "lucide-react";

import { useCart } from "../useCart";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Card para aplicar/remover um cupom de desconto. É um `<form>` próprio —
 * renderizado FORA do form de checkout (sem aninhamento de forms).
 */
export function CouponCard() {
  const { coupon, discount, couponHint, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || pending) return;
    setPending(true);
    const result = await applyCoupon(trimmed);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cupom aplicado!");
      setCode("");
    }
  }

  if (coupon) {
    return (
      <div className="border-border space-y-1.5 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Tag className="text-success size-4" />
            <span className="font-mono">{coupon.code}</span>
            {discount > 0 && (
              <span className="text-success">
                (−<Money value={discount} className="text-success text-sm" />)
              </span>
            )}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={removeCoupon}
            aria-label="Remover cupom"
            className="text-muted-foreground hover:text-destructive"
          >
            <X />
          </Button>
        </div>
        {coupon.description && (
          <p className="text-muted-foreground text-xs">{coupon.description}</p>
        )}
        {couponHint && <p className="text-warning text-xs">{couponHint}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Cupom de desconto"
        aria-label="Cupom de desconto"
        autoComplete="off"
        maxLength={40}
      />
      <Button
        type="submit"
        variant="outline"
        disabled={pending || !code.trim()}
        className="shrink-0"
      >
        {pending ? <Loader2 className="animate-spin" /> : <Tag />} Aplicar
      </Button>
    </form>
  );
}
