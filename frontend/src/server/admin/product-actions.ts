"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionState {
  error?: string;
}

const tierSchema = z.object({
  minQty: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
});

const productSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Informe o identificador")
    .regex(/^[a-z0-9-]+$/, "Use apenas minúsculas, números e hífens"),
  name: z.string().trim().min(2, "Informe o nome do produto"),
  categoryId: z.string().trim().min(1, "Selecione a categoria"),
  description: z.string().trim().default(""),
  price: z.coerce.number().min(0, "Preço inválido"),
  unit: z.string().trim().min(1).default("un"),
  minQty: z.coerce.number().int().min(1).default(1),
  tiers: z.array(tierSchema).default([]),
  active: z.boolean().default(true),
});

type ProductInput = z.infer<typeof productSchema>;

function parseTiers(raw: FormDataEntryValue | null): unknown {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function readForm(formData: FormData) {
  return productSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    unit: formData.get("unit"),
    minQty: formData.get("minQty"),
    tiers: parseTiers(formData.get("tiers")),
    active: formData.get("active") === "on",
  });
}

/** Remove faixas duplicadas (por minQty) e ordena por quantidade crescente. */
function normalizeTiers(tiers: ProductInput["tiers"]): ProductInput["tiers"] {
  const byMinQty = new Map<number, number>();
  for (const tier of tiers) byMinQty.set(tier.minQty, tier.price);
  return [...byMinQty.entries()]
    .map(([minQty, price]) => ({ minQty, price }))
    .sort((a, b) => a.minQty - b.minQty);
}

function toRow(input: ProductInput) {
  const tiers = normalizeTiers(input.tiers);
  return {
    id: input.id,
    category_id: input.categoryId,
    name: input.name,
    description: input.description,
    price: input.price,
    tiers: tiers.length ? tiers : null,
    unit: input.unit,
    min_qty: input.minQty,
    active: input.active,
  };
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").insert(toRow(parsed.data));
  if (error) return { error: error.message };

  revalidateCatalog();
  redirect("/admin");
}

export async function updateProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { id, ...rest } = toRow(parsed.data);
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update(rest).eq("id", id);
  if (error) return { error: error.message };

  revalidateCatalog();
  redirect("/admin");
}

export async function deleteProduct(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!id) return { error: "Produto inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateCatalog();
  return {};
}
