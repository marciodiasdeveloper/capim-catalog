import "server-only";

import type { Category, Product } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  mapCategory as mapCategoryRow,
  mapProduct as mapProductRow,
  type CategoryRow,
  type ProductRow,
} from "../row-mappers";

export interface AdminCategory extends Category {
  sortOrder: number;
}

export interface AdminProduct extends Product {
  active: boolean;
}

function mapCategory(row: CategoryRow): AdminCategory {
  return { ...mapCategoryRow(row), sortOrder: row.sort_order };
}

function mapProduct(row: ProductRow): AdminProduct {
  return { ...mapProductRow(row), active: row.active };
}

// Sem Supabase configurado, o admin volta vazio (não há onde escrever). O
// storefront, por outro lado, usa o mock como fallback — divergência proposital.
export async function getAdminCategories(): Promise<AdminCategory[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCategory);
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data) : null;
}

export async function getAdminCategory(id: string): Promise<AdminCategory | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCategory(data) : null;
}
