import type { Category } from "@/types";

/**
 * Categorias do catálogo (mock). `icon` é mapeado para um ícone lucide na UI.
 * Catálogo de exemplo: medicamentos de venda livre (MIPs) e itens de saúde.
 */
export const CATEGORIES: Category[] = [
  {
    id: "analgesicos",
    name: "Analgésicos e Antitérmicos",
    slug: "analgesicos",
    accent: "#3b82f6",
    icon: "pill",
  },
  {
    id: "gripe",
    name: "Gripe e Resfriado",
    slug: "gripe",
    accent: "#06b6d4",
    icon: "thermometer",
  },
  {
    id: "vitaminas",
    name: "Vitaminas e Suplementos",
    slug: "vitaminas",
    accent: "#f59e0b",
    icon: "leaf",
  },
  {
    id: "digestiva",
    name: "Saúde Digestiva",
    slug: "digestiva",
    accent: "#22c55e",
    icon: "heart-pulse",
  },
  {
    id: "primeiros-socorros",
    name: "Primeiros Socorros",
    slug: "primeiros-socorros",
    accent: "#ef4444",
    icon: "bandage",
  },
  {
    id: "higiene",
    name: "Higiene e Dermocosméticos",
    slug: "higiene",
    accent: "#a855f7",
    icon: "sparkles",
  },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);
