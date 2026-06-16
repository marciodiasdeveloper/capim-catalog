"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionState {
  error?: string;
}

const categorySchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Informe o identificador")
    .regex(/^[a-z0-9-]+$/, "Use apenas minúsculas, números e hífens"),
  name: z.string().trim().min(2, "Informe o nome"),
  slug: z
    .string()
    .trim()
    .min(2, "Informe o slug")
    .regex(/^[a-z0-9-]+$/, "Slug: minúsculas, números e hífens"),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use cor hex (#rrggbb)")
    .default("#3b82f6"),
  icon: z.string().trim().min(1).default("pill"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

type CategoryInput = z.infer<typeof categorySchema>;

function readForm(formData: FormData) {
  return categorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    accent: formData.get("accent"),
    icon: formData.get("icon"),
    sortOrder: formData.get("sortOrder"),
  });
}

function toRow(input: CategoryInput) {
  return {
    id: input.id,
    name: input.name,
    slug: input.slug,
    accent: input.accent,
    icon: input.icon,
    sort_order: input.sortOrder,
  };
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").insert(toRow(parsed.data));
  if (error) return { error: error.message };

  revalidateCatalog();
  redirect("/admin");
}

export async function updateCategory(
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
  const { error } = await supabase.from("categories").update(rest).eq("id", id);
  if (error) return { error: error.message };

  revalidateCatalog();
  redirect("/admin");
}

export async function deleteCategory(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!id) return { error: "Categoria inválida." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return {
      error: error.message.includes("foreign key")
        ? "Não dá para excluir: há produtos nesta categoria."
        : error.message,
    };
  }

  revalidateCatalog();
  return {};
}
