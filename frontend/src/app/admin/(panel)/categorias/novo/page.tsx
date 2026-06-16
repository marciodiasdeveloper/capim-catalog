import { createCategory } from "@/server/admin/category-actions";
import { CategoryForm } from "@/features/admin/components/CategoryForm";
import { SectionTitle } from "@/components/ui/section-title";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <SectionTitle>Nova categoria</SectionTitle>
      <CategoryForm mode="create" action={createCategory} />
    </div>
  );
}
