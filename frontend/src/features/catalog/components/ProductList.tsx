import { PackageOpen } from "lucide-react";

import type { CategoryGroup } from "../hooks/useCatalogFilters";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/empty-state";

/** Lista de produtos agrupada por categoria. */
export function ProductList({ groups }: { groups: CategoryGroup[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen />}
        title="Nenhum produto encontrado"
        description="Tente outra busca ou selecione outra categoria."
      />
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(({ category, products }) => (
        <section
          key={category.id}
          className="animate-in fade-in space-y-3 duration-300"
        >
          <h3 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            {category.name}
          </h3>
          <div className="grid gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                category={category}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
