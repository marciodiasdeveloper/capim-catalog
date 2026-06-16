"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { Category } from "@/types";
import type { AdminProduct } from "@/server/admin/queries";
import type { ActionState } from "@/server/admin/product-actions";
import { TiersField } from "./TiersField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

interface ProductFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Category[];
  product?: AdminProduct;
  mode: "create" | "edit";
}

export function ProductForm({
  action,
  categories,
  product,
  mode,
}: ProductFormProps) {
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

      <FormField id="id" label="Identificador (id)">
        <Input
          id="id"
          name="id"
          defaultValue={product?.id}
          readOnly={mode === "edit"}
          placeholder="dipirona-500"
          required
        />
      </FormField>

      <FormField id="name" label="Nome">
        <Input id="name" name="name" defaultValue={product?.name} required />
      </FormField>

      <FormField id="categoryId" label="Categoria">
        <NativeSelect
          id="categoryId"
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          required
        >
          <option value="" disabled>
            Selecione
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <FormField id="description" label="Descrição">
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          rows={2}
        />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField id="price" label="Preço (R$)">
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={product?.price}
            required
          />
        </FormField>
        <FormField id="unit" label="Unidade">
          <Input id="unit" name="unit" defaultValue={product?.unit ?? "un"} />
        </FormField>
        <FormField id="minQty" label="Mín.">
          <Input
            id="minQty"
            name="minQty"
            type="number"
            min={1}
            defaultValue={product?.minQty ?? 1}
          />
        </FormField>
      </div>

      <TiersField defaultTiers={product?.tiers} />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? true}
          className="accent-primary size-4"
        />
        Produto ativo (visível no catálogo)
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : mode === "create"
              ? "Criar produto"
              : "Salvar alterações"}
        </Button>
        <Link href="/admin" className={cn(buttonVariants({ variant: "ghost" }))}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
