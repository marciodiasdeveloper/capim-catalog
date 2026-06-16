"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";

export interface ActionState {
  error?: string;
  ok?: boolean;
}

type CompanyInsert = Database["public"]["Tables"]["company_settings"]["Insert"];

const LOGO_BUCKET = "company-logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB

const companySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da empresa"),
  tagline: z.string().trim().default(""),
  whatsapp: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine(
      (value) => /^\d{10,15}$/.test(value),
      "WhatsApp: informe DDI + DDD + número (só dígitos)"
    ),
  atendente: z.string().trim().default(""),
  pixTitular: z.string().trim().default(""),
  pixChaveTipo: z.string().trim().default(""),
  pixChave: z.string().trim().default(""),
  pixBanco: z.string().trim().default(""),
});

function readForm(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get("name") ?? "",
    tagline: formData.get("tagline") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    atendente: formData.get("atendente") ?? "",
    pixTitular: formData.get("pixTitular") ?? "",
    pixChaveTipo: formData.get("pixChaveTipo") ?? "",
    pixChave: formData.get("pixChave") ?? "",
    pixBanco: formData.get("pixBanco") ?? "",
  });
}

export async function updateCompany(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const supabase = createAdminClient();

  // logo_url: undefined = manter o atual; null = remover; string = nova URL.
  let logoUrl: string | null | undefined;
  const file = formData.get("logo");
  if (formData.get("removeLogo") === "on") {
    logoUrl = null;
  } else if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return { error: "O logo deve ser um arquivo de imagem." };
    }
    if (file.size > MAX_LOGO_BYTES) {
      return { error: "O logo deve ter no máximo 2 MB." };
    }
    const ext = file.name.includes(".")
      ? file.name.split(".").pop()!.toLowerCase()
      : "png";
    const path = `logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      return { error: `Falha no upload do logo: ${uploadError.message}` };
    }
    logoUrl = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data
      .publicUrl;
  }

  const row: CompanyInsert = {
    id: "default",
    name: data.name,
    tagline: data.tagline,
    whatsapp: data.whatsapp,
    atendente: data.atendente,
    pix_titular: data.pixTitular,
    pix_chave_tipo: data.pixChaveTipo,
    pix_chave: data.pixChave,
    pix_banco: data.pixBanco,
  };
  if (logoUrl !== undefined) row.logo_url = logoUrl;

  const { error } = await supabase.from("company_settings").upsert(row);
  if (error) return { error: error.message };

  // A empresa aparece nos headers (layouts do site e do admin), no checkout e
  // nos títulos das páginas — revalida toda a árvore de layout.
  revalidatePath("/", "layout");
  return { ok: true };
}
