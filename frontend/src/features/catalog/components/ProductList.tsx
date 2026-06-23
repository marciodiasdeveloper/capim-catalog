"use client";

import { PackageOpen } from "lucide-react";

import type { CategoryGroup } from "../hooks/useCatalogFilters";
import { useCart } from "@/features/cart/useCart";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/empty-state";

/** Lista de produtos agrupada por categoria. */
export function ProductList({ groups }: { groups: CategoryGroup[] }) {
  // A assinatura ao carrinho vive aqui; os cards recebem qty por prop e são
  // memoizados, então só o card alterado re-renderiza (não a lista inteira).
  const { quantities, setQty } = useCart();

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
          <h3 className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <span
              aria-hidden
              className="h-3.5 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: category.accent }}
            />
            {category.name}
          </h3>
          <div className="grid gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                category={category}
                qty={quantities[product.id] ?? 0}
                onSetQty={setQty}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
