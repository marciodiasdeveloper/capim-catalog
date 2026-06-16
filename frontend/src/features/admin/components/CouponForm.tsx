"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { Coupon } from "@/types";
import type { ActionState } from "@/server/admin/coupon-actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

interface CouponFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  coupon?: Coupon;
  mode: "create" | "edit";
}

export function CouponForm({ action, coupon, mode }: CouponFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-2 text-sm">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField id="id" label="Identificador (id)">
          <Input
            id="id"
            name="id"
            defaultValue={coupon?.id}
            readOnly={mode === "edit"}
            placeholder="black-friday"
            required
          />
        </FormField>
        <FormField id="code" label="Código (o cliente digita)">
          <Input
            id="code"
            name="code"
            defaultValue={coupon?.code}
            placeholder="BLACKFRIDAY"
            className="font-mono uppercase"
            required
          />
        </FormField>
      </div>

      <FormField id="description" label="Descrição">
        <Input
          id="description"
          name="description"
          defaultValue={coupon?.description}
          placeholder="10% de boas-vindas"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="discountType" label="Tipo de desconto">
          <NativeSelect
            id="discountType"
            name="discountType"
            defaultValue={coupon?.discountType ?? "percentage"}
            required
          >
            <option value="percentage">Percentual (%)</option>
            <option value="fixed">Valor fixo (R$)</option>
          </NativeSelect>
        </FormField>
        <FormField id="discountValue" label="Valor do desconto">
          <Input
            id="discountValue"
            name="discountValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue={coupon?.discountValue}
            placeholder="10"
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField id="minItems" label="Mín. de itens">
          <Input
            id="minItems"
            name="minItems"
            type="number"
            min="0"
            defaultValue={coupon?.minItems ?? 0}
          />
        </FormField>
        <FormField id="minSubtotal" label="Subtotal mín.">
          <Input
            id="minSubtotal"
            name="minSubtotal"
            type="number"
            step="0.01"
            min="0"
            defaultValue={coupon?.minSubtotal ?? 0}
          />
        </FormField>
        <FormField id="maxDiscount" label="Teto (R$)">
          <Input
            id="maxDiscount"
            name="maxDiscount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={coupon?.maxDiscount ?? ""}
            placeholder="opcional"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="maxUses" label="Usos máximos">
          <Input
            id="maxUses"
            name="maxUses"
            type="number"
            min="1"
            defaultValue={coupon?.maxUses ?? ""}
            placeholder="ilimitado"
          />
        </FormField>
        <FormField id="expiresAt" label="Expira em">
          <Input
            id="expiresAt"
            name="expiresAt"
            type="date"
            defaultValue={coupon?.expiresAtISO?.slice(0, 10) ?? ""}
          />
        </FormField>
      </div>

      {mode === "edit" && coupon && (
        <p className="text-muted-foreground text-xs">
          Usos até agora: {coupon.currentUses}
        </p>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={coupon?.active ?? true}
          className="accent-primary size-4"
        />
        Cupom ativo (disponível para uso)
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : mode === "create"
              ? "Criar cupom"
              : "Salvar alterações"}
        </Button>
        <Link
          href="/admin/cupons"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
