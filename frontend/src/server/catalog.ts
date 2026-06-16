import "server-only";

import { cache } from "react";

import type { Category, Product } from "@/types";
import { CATEGORIES as MOCK_CATEGORIES } from "@/data/categories";
import { PRODUCTS as MOCK_PRODUCTS } from "@/data/products";
import { createReadClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { mapCategory, mapProduct } from "./row-mappers";

/**
 * Repositório de catálogo. Lê do Supabase quando configurado; caso contrário
 * cai no mock (`src/data`), mantendo o app funcional sem banco.
 * `cache()` deduplica as consultas dentro da mesma requisição.
 */

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return MOCK_CATEGORIES;

  const supabase = createReadClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Erro ao carregar categorias: ${error.message}`);
  return (data ?? []).map(mapCategory);
});

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return MOCK_PRODUCTS;

  const supabase = createReadClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(`Erro ao carregar produtos: ${error.message}`);
  return (data ?? []).map(mapProduct);
});

/** Mapa productId → Product, usado pelo carrinho para reidratar itens salvos. */
export const getProductsById = cache(async (): Promise<Record<string, Product>> => {
  const products = await getProducts();
  return Object.fromEntries(products.map((p) => [p.id, p]));
});
