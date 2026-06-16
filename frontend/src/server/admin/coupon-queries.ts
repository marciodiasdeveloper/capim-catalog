import "server-only";

import type { Coupon } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { mapCoupon } from "../row-mappers";

export async function getAdminCoupons(): Promise<Coupon[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao carregar cupons: ${error.message}`);
  return (data ?? []).map(mapCoupon);
}

export async function getAdminCoupon(id: string): Promise<Coupon | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCoupon(data) : null;
}
