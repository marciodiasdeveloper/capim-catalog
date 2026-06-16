"use client";

import { Trash2 } from "lucide-react";

import { useCart } from "../useCart";
import { getUnitPrice } from "@/lib/pricing";
import { stepQty } from "@/lib/cart";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

/** Seção do carrinho: itens com alterar quantidade e excluir. */
export function CartItemsSection() {
  const { items, count, setQty, clearItems } = useCart();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase">Carrinho</h3>
        {count > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearItems}
            className="text-muted-foreground"
          >
            <Trash2 /> Limpar
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Seu pedido está vazio. Adicione produtos ao lado.
        </p>
      ) : (
        <ul
          aria-label="Itens do pedido"
          className="scrollbar-thin max-h-64 space-y-3 overflow-y-auto pr-1"
        >
          {items.map(({ product, qty }) => {
            const { price } = getUnitPrice(product, qty);
            return (
              <li key={product.id} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2 text-sm">
                  <p className="min-w-0 truncate">{product.name}</p>
                  <Money value={price * qty} className="shrink-0" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <QuantityStepper
                    size="sm"
                    value={qty}
                    onChange={(next) =>
                      setQty(product.id, stepQty(qty, next, product.minQty))
                    }
                  />
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <span>
                      <Money value={price} className="text-xs" />/{product.unit}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setQty(product.id, 0)}
                      aria-label={`Remover ${product.name}`}
                      className="hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
