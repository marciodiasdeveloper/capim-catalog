"use client";

import { memo } from "react";

import type { Category, Product } from "@/types";
import { getUnitPrice } from "@/lib/pricing";
import { stepQty } from "@/lib/cart";
import { track, shouldTrackAdd } from "@/lib/analytics/track";
import { formatBRL } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductThumb } from "./ProductThumb";

interface ProductCardProps {
  product: Product;
  category: Category;
  qty: number;
  onSetQty: (productId: string, qty: number) => void;
}

/**
 * Card de produto — apresentacional (recebe `qty` + setter por props) e
 * memoizado: só re-renderiza quando a SUA quantidade muda, não a de outros
 * produtos. A assinatura por props (em vez de `useCart()` interno) é o que
 * torna o `memo` efetivo e evita o re-render de toda a lista.
 */
export const ProductCard = memo(function ProductCard({
  product,
  category,
  qty,
  onSetQty,
}: ProductCardProps) {
  const { price, isWholesale } = getUnitPrice(product, qty);
  const tiersLabel = product.tiers
    ?.map((t) => `${t.minQty}+ ${formatBRL(t.price)}`)
    .join(" · ");

  function handleQtyChange(next: number) {
    const clamped = stepQty(qty, next, product.minQty);
    // Conta como "adição ao carrinho" só quando a quantidade aumenta.
    if (shouldTrackAdd(qty, clamped)) {
      track({ type: "add_to_cart", productId: product.id, qty: clamped - qty });
    }
    onSetQty(product.id, clamped);
  }

  return (
    <Card
      size="sm"
      className="transition hover:-translate-y-0.5 hover:ring-foreground/20"
    >
      <CardContent className="flex items-start gap-3">
        <ProductThumb category={category} />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <h4 className="leading-snug font-medium">{product.name}</h4>
            <div className="shrink-0 text-right">
              <Money value={product.price} className="block font-semibold" />
              <span className="text-muted-foreground text-[10px] uppercase">
                unitário
              </span>
            </div>
          </div>

          {tiersLabel && (
            <p className="text-xs">
              <span className="text-muted-foreground">Atacado: </span>
              <span style={{ color: category.accent }}>{tiersLabel}</span>
            </p>
          )}

          <p className="text-muted-foreground line-clamp-2 text-xs">
            {product.description}
          </p>

          <div className="mt-1 flex items-center justify-between gap-2">
            <QuantityStepper value={qty} onChange={handleQtyChange} />
            <span className="text-muted-foreground text-xs">
              mín {product.minQty} · {product.unit}
            </span>
          </div>

          {qty > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-1 flex items-center justify-between gap-2 text-xs duration-300">
              {isWholesale ? (
                <Badge
                  variant="outline"
                  className="border-success/30 text-success animate-in zoom-in-95"
                >
                  preço de atacado
                </Badge>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground">
                Subtotal:{" "}
                <Money value={price * qty} className="text-foreground" />
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
