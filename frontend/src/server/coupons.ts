import "server-only";

import type { Coupon } from "@/types";
import { COUPON_BY_CODE } from "@/data/coupons";
import { createReadClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { mapCoupon } from "./row-mappers";

/**
 * Busca um cupom ATIVO pelo código (case-insensitive). Retorna null se não
 * existir ou estiver inativo. Sem Supabase, usa o mock.
 */
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  if (!isSupabaseConfigured()) {
    const coupon = COUPON_BY_CODE[normalized];
    return coupon && coupon.active ? coupon : null;
  }

  const supabase = createReadClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar cupom: ${error.message}`);
  return data ? mapCoupon(data) : null;
}
