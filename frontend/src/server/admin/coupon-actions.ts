"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionState {
  error?: string;
}

const couponSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Informe o identificador")
    .regex(/^[a-z0-9-]+$/, "Use apenas minúsculas, números e hífens"),
  code: z
    .string()
    .trim()
    .min(2, "Informe o código")
    .regex(/^[A-Za-z0-9-]+$/, "Código: letras, números e hífens")
    .transform((s) => s.toUpperCase()),
  description: z.string().trim().max(200).default(""),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Desconto deve ser maior que 0"),
  minItems: z.coerce.number().int().min(0),
  minSubtotal: z.coerce.number().min(0),
  maxDiscount: z.coerce.number().positive("Teto deve ser positivo").nullable(),
  active: z.boolean(),
  maxUses: z.coerce.number().int().positive("Usos deve ser positivo").nullable(),
  expiresAt: z.string().nullable(),
}).superRefine((data, ctx) => {
  if (data.discountType === "percentage" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountValue"],
      message: "Percentual não pode passar de 100%.",
    });
  }
});

type CouponInput = z.infer<typeof couponSchema>;

/** Campo numérico opcional: string vazia → null. */
function optionalNumber(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function readForm(formData: FormData) {
  const rawExpires = formData.get("expiresAt");
  const expiresAt =
    typeof rawExpires === "string" && rawExpires.trim()
      ? `${rawExpires}T23:59:59.999Z`
      : null;

  return couponSchema.safeParse({
    id: formData.get("id"),
    code: formData.get("code"),
    description: formData.get("description") ?? "",
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minItems: formData.get("minItems") ?? 0,
    minSubtotal: formData.get("minSubtotal") ?? 0,
    maxDiscount: optionalNumber(formData.get("maxDiscount")),
    active: formData.get("active") === "on",
    maxUses: optionalNumber(formData.get("maxUses")),
    expiresAt,
  });
}

function toRow(input: CouponInput) {
  return {
    id: input.id,
    code: input.code,
    description: input.description,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_items: input.minItems,
    min_subtotal: input.minSubtotal,
    max_discount: input.maxDiscount,
    active: input.active,
    max_uses: input.maxUses,
    expires_at: input.expiresAt,
  };
}

export async function createCoupon(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").insert(toRow(parsed.data));
  if (error) return { error: error.message };

  revalidatePath("/admin/cupons");
  redirect("/admin/cupons");
}

export async function updateCoupon(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  // Não toca em current_uses (preserva o contador).
  const { id, ...rest } = toRow(parsed.data);
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").update(rest).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/cupons");
  redirect("/admin/cupons");
}

export async function deleteCoupon(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!id) return { error: "Cupom inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/cupons");
  return {};
}
