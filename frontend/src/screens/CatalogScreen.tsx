"use client";

import type { Category, Product } from "@/types";
import type { RankedUser } from "@/data/ranking";
import { useCatalogFilters } from "@/features/catalog/hooks/useCatalogFilters";
import { CategoryTabs } from "@/features/catalog/components/CategoryTabs";
import { SearchBar } from "@/features/catalog/components/SearchBar";
import { ProductList } from "@/features/catalog/components/ProductList";
import { RankingBanner } from "@/features/gamification/components/RankingBanner";
import { OrderSummary } from "@/features/cart/components/OrderSummary";
import { CustomerForm } from "@/features/cart/components/CustomerForm";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CatalogScreenProps {
  categories: Category[];
  products: Product[];
  rankingTop: RankedUser[];
  currentRank: RankedUser | null;
}

/** Tela principal: ranking + catálogo "Monte seu pedido" + resumo/dados. */
export function CatalogScreen({
  categories,
  products,
  rankingTop,
  currentRank,
}: CatalogScreenProps) {
  const {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    groups,
    counts,
    totalCount,
  } = useCatalogFilters(categories, products);

  return (
    <Container className="space-y-6 py-6">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <RankingBanner top={rankingTop} currentRank={currentRank} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div
          className="animate-in fade-in slide-in-from-bottom-2 min-w-0 space-y-4 duration-500"
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          <SectionTitle description="Adicione os produtos e finalize pelo WhatsApp.">
            Monte seu pedido
          </SectionTitle>

          <div className="space-y-3">
            <SearchBar value={query} onChange={setQuery} />
            <CategoryTabs
              active={activeCategory}
              onChange={setActiveCategory}
              categories={categories}
              counts={counts}
              totalCount={totalCount}
            />
          </div>

          <ProductList groups={groups} />
        </div>

        <aside
          id="resumo"
          className="animate-in fade-in slide-in-from-bottom-2 min-w-0 duration-500 lg:sticky lg:top-20 lg:flex lg:flex-col lg:max-h-[calc(100dvh-6rem)]"
          style={{ animationDelay: "150ms", animationFillMode: "both" }}
        >
          <Card className="lg:min-h-0">
            <CardContent className="space-y-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto scrollbar-thin">
              <OrderSummary />
              <Separator />
              <CustomerForm />
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
