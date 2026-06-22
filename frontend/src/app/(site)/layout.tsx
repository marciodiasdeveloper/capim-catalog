import { getProductsById } from "@/server/catalog";
import { getCompany } from "@/server/company";
import { getAdminUser } from "@/lib/supabase/auth";
import { CartProvider } from "@/features/cart/CartContext";
import { CompanyProvider } from "@/features/company/CompanyContext";
import { PageViewTracker } from "@/features/analytics/PageViewTracker";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/** Layout do storefront: carrinho + cabeçalho da loja. */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [productsById, company, adminUser] = await Promise.all([
    getProductsById(),
    getCompany(),
    getAdminUser(),
  ]);

  return (
    <CartProvider products={productsById}>
      <CompanyProvider company={company}>
        <PageViewTracker />
        <a
          href="#conteudo"
          className="bg-background focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:ring-2"
        >
          Pular para o conteúdo
        </a>
        <Header isAdmin={Boolean(adminUser)} />
        <main
          id="conteudo"
          tabIndex={-1}
          className="w-full flex-1 overflow-x-clip outline-none"
        >
          {children}
        </main>
        <Footer company={company} />
      </CompanyProvider>
    </CartProvider>
  );
}
