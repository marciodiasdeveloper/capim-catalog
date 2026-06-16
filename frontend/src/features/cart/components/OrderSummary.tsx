"use client";

import { Trash2 } from "lucide-react";

import { useCart } from "../useCart";
import { getUnitPrice } from "@/lib/pricing";
import { formatBRL } from "@/lib/format";
import { BRAZIL_STATES, FRETE_GRATIS_ACIMA } from "@/constants";
import { Money } from "@/components/ui/money";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Resumo do pedido: entrega + itens + subtotal, frete e total. */
export function OrderSummary() {
  const {
    items,
    subtotal,
    frete,
    total,
    count,
    clearItems,
    customer,
    patchCustomer,
    deliveryOptions,
    deliveryId,
    setDelivery,
    selectedDelivery,
    freteGratis,
  } = useCart();

  const hasUf = deliveryOptions.length > 0;
  const faltaFreteGratis = Math.max(0, FRETE_GRATIS_ACIMA - subtotal);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase">Resumo</h3>
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

      <div className="space-y-1.5">
        <Label htmlFor="estado" className="text-muted-foreground text-xs">
          Estado
        </Label>
        <Select
          value={customer.uf}
          onValueChange={(value) => patchCustomer({ uf: String(value ?? "") })}
        >
          <SelectTrigger id="estado" className="w-full">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {BRAZIL_STATES.map((state) => (
              <SelectItem key={state.uf} value={state.uf}>
                {state.name} ({state.uf})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entrega" className="text-muted-foreground text-xs">
          Entrega
        </Label>
        <Select
          value={deliveryId}
          onValueChange={(value) => setDelivery(String(value ?? ""))}
          disabled={!hasUf}
        >
          <SelectTrigger id="entrega" className="w-full">
            <SelectValue
              placeholder={
                hasUf
                  ? "Selecione a entrega"
                  : "Preencha a UF para ver as opções"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {deliveryOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label} —{" "}
                {option.price === 0 ? "Grátis" : formatBRL(option.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedDelivery && (
          <p className="text-muted-foreground text-xs">{selectedDelivery.eta}</p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Seu pedido está vazio. Adicione produtos ao lado.
        </p>
      ) : (
        <ul
          aria-label="Itens do pedido"
          className="scrollbar-thin max-h-56 space-y-2 overflow-y-auto pr-1"
        >
          {items.map(({ product, qty }) => {
            const { price } = getUnitPrice(product, qty);
            return (
              <li
                key={product.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate">{product.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {qty} × <Money value={price} className="text-xs" />
                  </p>
                </div>
                <Money value={price * qty} className="shrink-0" />
              </li>
            );
          })}
        </ul>
      )}

      <Separator />

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>
            <Money value={subtotal} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Frete</dt>
          <dd>
            {!selectedDelivery ? (
              <span className="text-muted-foreground">—</span>
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

      <Separator />

      <div className="flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span key={total} className="animate-in fade-in duration-300">
          <Money value={total} className="text-lg font-bold" />
        </span>
      </div>
    </div>
  );
}
