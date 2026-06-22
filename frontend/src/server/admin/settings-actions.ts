"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "./company-actions";

/**
 * Salva as chaves de configuração (feature flags) no singleton company_settings.
 * Usa `update` na linha 'default' (não upsert) para não exigir os campos NOT NULL
 * da empresa — a linha é criada ao salvar a aba Empresa (ou via `pnpm seed`).
 */
export async function updateSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const gamificationEnabled = formData.get("gamificationEnabled") === "on";

  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("company_settings")
    .update({ gamification_enabled: gamificationEnabled }, { count: "exact" })
    .eq("id", "default");

  if (error) return { error: error.message };
  if (count === 0) {
    return { error: "Salve os dados da empresa primeiro (aba Empresa)." };
  }

  // A chave afeta header, rodapé, home e a rota /ranking — revalida o layout inteiro.
  revalidatePath("/", "layout");
  return { ok: true };
}
