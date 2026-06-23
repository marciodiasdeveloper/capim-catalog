import { getCategories, getProducts } from "@/server/catalog";
import { getMonthlyRanking } from "@/server/orders/ranking";
import { CatalogScreen } from "@/screens/CatalogScreen";
import { AuroraBackground } from "@/components/layout/AuroraBackground";

export default async function Home() {
  const [categories, products, ranking] = await Promise.all([
    getCategories(),
    getProducts(),
    getMonthlyRanking(),
  ]);

  const rankingTop = ranking.slice(0, 5);
  const currentRank = ranking.find((user) => user.isCurrent) ?? null;

  return (
    <>
      <AuroraBackground />
      <CatalogScreen
        categories={categories}
        products={products}
        rankingTop={rankingTop}
        currentRank={currentRank}
      />
    </>
  );
}
