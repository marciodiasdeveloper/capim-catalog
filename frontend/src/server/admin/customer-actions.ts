"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionState {
  error?: string;
}

const customerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Informe o nome"),
  phone: z.string().trim().default(""),
  rua: z.string().trim().default(""),
  numero: z.string().trim().default(""),
  bairro: z.string().trim().default(""),
  complemento: z.string().trim().default(""),
  cidade: z.string().trim().default(""),
  uf: z.string().trim().default(""),
  cep: z.string().trim().default(""),
  observacao: z.string().trim().default(""),
});

export async function updateCustomer(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = customerSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    rua: formData.get("rua"),
    numero: formData.get("numero"),
    bairro: formData.get("bairro"),
    complemento: formData.get("complemento"),
    cidade: formData.get("cidade"),
    uf: formData.get("uf"),
    cep: formData.get("cep"),
    observacao: formData.get("observacao"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { id, ...fields } = parsed.data;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .update(fields)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/ranking");
  redirect(`/admin/clientes/${id}`);
}

export async function deleteCustomer(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!id) return { error: "Cliente inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/clientes");
  revalidatePath("/ranking");
  return {};
}
