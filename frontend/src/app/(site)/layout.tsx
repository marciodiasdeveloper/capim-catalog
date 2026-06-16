import { getProductsById } from "@/server/catalog";
import { CartProvider } from "@/features/cart/CartContext";
import { Header } from "@/components/layout/Header";

/** Layout do storefront: carrinho + cabeçalho da loja. */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const productsById = await getProductsById();

  return (
    <CartProvider products={productsById}>
      <Header />
      <main className="w-full flex-1 overflow-x-clip">{children}</main>
    </CartProvider>
  );
}
