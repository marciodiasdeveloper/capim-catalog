"use client";

import { useCart } from "../useCart";
import { FRETE_GRATIS_ACIMA } from "@/constants";
import { Money } from "@/components/ui/money";

/** Resumo da compra: subtotal, frete, total e progresso de frete grátis. */
export function OrderTotals() {
  const {
    subtotal,
    discount,
    coupon,
    frete,
    total,
    selectedDelivery,
    freteGratis,
  } = useCart();
  const faltaFreteGratis = Math.max(0, FRETE_GRATIS_ACIMA - subtotal);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold tracking-wide uppercase">
        Resumo da compra
      </h3>

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>
            <Money value={subtotal} />
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Desconto{coupon ? ` (${coupon.code})` : ""}
            </dt>
            <dd className="text-success">
              −<Money value={discount} className="text-success" />
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Frete</dt>
          <dd>
            {!selectedDelivery ? (
              <span className="text-muted-foreground">—</span>
            ) : selectedDelivery.price === 0 ? (
              <span className="text-muted-foreground">Sem frete</span>
            ) : frete === 0 ? (
              <span className="text-success">Grátis</span>
            ) : (
              <Money value={frete} />
            )}
          </dd>
        </div>
      </dl>

      {subtotal > 0 && (
        <div className="space-y-1">
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-success h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.min(100, (subtotal / FRETE_GRATIS_ACIMA) * 100)}%`,
              }}
            />
          </div>
          {freteGratis ? (
            <p className="text-success animate-in zoom-in text-xs font-medium">
              🎉 Você ganhou frete grátis!
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Faltam <Money value={faltaFreteGratis} className="text-xs" /> para
              frete grátis.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <span className="font-semibold">Total</span>
        <span key={total} className="animate-in fade-in duration-300">
          <Money value={total} className="text-lg font-bold" />
        </span>
      </div>
    </div>
  );
}
