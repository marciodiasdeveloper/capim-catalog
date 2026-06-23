"use client";

import type { Category } from "@/types";
import { ALL_CATEGORY } from "../hooks/useCatalogFilters";
import { CategoryIcon } from "../CategoryIcon";
import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  active: string;
  onChange: (categoryId: string) => void;
  categories: Category[];
  counts: Record<string, number>;
  totalCount: number;
}

function Count({ value }: { value: number }) {
  return <span className="opacity-60 tabular-nums">({value})</span>;
}

/** Filtro de categorias em pílulas que quebram linha (Todos + categorias). */
export function CategoryTabs({
  active,
  onChange,
  categories,
  counts,
  totalCount,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant={active === ALL_CATEGORY ? "default" : "outline"}
        onClick={() => onChange(ALL_CATEGORY)}
        className="rounded-full px-3.5"
      >
        Todos <Count value={totalCount} />
      </Button>
      {categories.map((category) => {
        const isActive = active === category.id;
        return (
          <Button
            key={category.id}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={() => onChange(category.id)}
            className="rounded-full px-3.5"
            style={
              isActive
                ? {
                    backgroundColor: category.accent,
                    borderColor: category.accent,
                    color: "#fff",
                  }
                : undefined
            }
          >
            <span
              className="inline-flex items-center"
              style={isActive ? undefined : { color: category.accent }}
            >
              <CategoryIcon icon={category.icon} />
            </span>
            {category.name} <Count value={counts[category.id] ?? 0} />
          </Button>
        );
      })}
    </div>
  );
}
