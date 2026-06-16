"use client";

import { useMemo, useState } from "react";

import type { Category, Product } from "@/types";

export const ALL_CATEGORY = "todos";

export interface CategoryGroup {
  category: Category;
  products: Product[];
}

/** Remove acentos e normaliza para busca insensível a maiúsculas/acentos. */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Gerencia busca + categoria ativa e devolve os produtos agrupados por categoria. */
export function useCatalogFilters(
  categories: Category[],
  products: Product[]
) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);

  const normalizedQuery = useMemo(() => normalize(query.trim()), [query]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORY ||
        product.categoryId === activeCategory;
      const matchesQuery =
        normalizedQuery === "" ||
        normalize(product.name).includes(normalizedQuery) ||
        normalize(product.description).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, normalizedQuery]);

  const groups = useMemo<CategoryGroup[]>(() => {
    return categories
      .map((category) => ({
        category,
        products: filtered.filter((p) => p.categoryId === category.id),
      }))
      .filter((group) => group.products.length > 0);
  }, [categories, filtered]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const product of products) {
      map[product.categoryId] = (map[product.categoryId] ?? 0) + 1;
    }
    return map;
  }, [products]);

  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    groups,
    counts,
    totalCount: products.length,
    totalResults: filtered.length,
  };
}
