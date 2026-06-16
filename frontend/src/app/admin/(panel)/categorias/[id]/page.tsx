import { notFound } from "next/navigation";

import { getAdminCategory } from "@/server/admin/queries";
import { updateCategory } from "@/server/admin/category-actions";
import { CategoryForm } from "@/features/admin/components/CategoryForm";
import { SectionTitle } from "@/components/ui/section-title";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getAdminCategory(id);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <SectionTitle description={category.id}>Editar categoria</SectionTitle>
      <CategoryForm mode="edit" action={updateCategory} category={category} />
    </div>
  );
}
