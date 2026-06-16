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
      <a
        href="#conteudo"
        className="bg-background focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:ring-2"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main
        id="conteudo"
        tabIndex={-1}
        className="w-full flex-1 overflow-x-clip outline-none"
      >
        {children}
      </main>
    </CartProvider>
  );
}
