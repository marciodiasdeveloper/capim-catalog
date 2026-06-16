import { notFound } from "next/navigation";

import { getAdminCategories, getAdminProduct } from "@/server/admin/queries";
import { updateProduct } from "@/server/admin/product-actions";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { SectionTitle } from "@/components/ui/section-title";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <SectionTitle description={product.id}>Editar produto</SectionTitle>
      <ProductForm
        mode="edit"
        action={updateProduct}
        categories={categories}
        product={product}
      />
    </div>
  );
}
