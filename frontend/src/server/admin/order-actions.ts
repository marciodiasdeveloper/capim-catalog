"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionState {
  error?: string;
}

const statusSchema = z.enum(["pending", "paid", "cancelled"]);

export async function setOrderStatus(
  id: string,
  status: string
): Promise<ActionState> {
  await requireAdmin();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success || !id) return { error: "Status inválido." };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: parsed.data })
    .eq("id", id)
    .select("customer_id")
    .maybeSingle();
  if (error) return { error: error.message };

  // O ranking e o "total gasto" do cliente contam só pedidos pagos.
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/clientes");
  if (data?.customer_id) {
    revalidatePath(`/admin/clientes/${data.customer_id}`);
  }
  revalidatePath("/ranking");
  revalidatePath("/");
  return {};
}
