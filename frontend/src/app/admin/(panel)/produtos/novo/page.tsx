import { getAdminCategories } from "@/server/admin/queries";
import { createProduct } from "@/server/admin/product-actions";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { SectionTitle } from "@/components/ui/section-title";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <SectionTitle>Novo produto</SectionTitle>
      <ProductForm mode="create" action={createProduct} categories={categories} />
    </div>
  );
}
