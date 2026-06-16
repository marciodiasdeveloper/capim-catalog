"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AdminCategory } from "@/server/admin/queries";
import type { ActionState } from "@/server/admin/category-actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  "pill",
  "thermometer",
  "leaf",
  "heart-pulse",
  "bandage",
  "sparkles",
];

interface CategoryFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  category?: AdminCategory;
  mode: "create" | "edit";
}

export function CategoryForm({ action, category, mode }: CategoryFormProps) {
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
            defaultValue={category?.id}
            readOnly={mode === "edit"}
            placeholder="analgesicos"
            required
          />
        </FormField>
        <FormField id="slug" label="Slug">
          <Input
            id="slug"
            name="slug"
            defaultValue={category?.slug}
            placeholder="analgesicos"
            required
          />
        </FormField>
      </div>

      <FormField id="name" label="Nome">
        <Input id="name" name="name" defaultValue={category?.name} required />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField id="accent" label="Cor (hex)">
          <Input
            id="accent"
            name="accent"
            defaultValue={category?.accent ?? "#3b82f6"}
            placeholder="#3b82f6"
          />
        </FormField>
        <FormField id="icon" label="Ícone">
          <NativeSelect
            id="icon"
            name="icon"
            defaultValue={category?.icon ?? "pill"}
          >
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField id="sortOrder" label="Ordem">
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={category?.sortOrder ?? 0}
          />
        </FormField>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : mode === "create"
              ? "Criar categoria"
              : "Salvar alterações"}
        </Button>
        <Link href="/admin" className={cn(buttonVariants({ variant: "ghost" }))}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
