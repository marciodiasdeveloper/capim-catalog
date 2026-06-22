import Link from "next/link";
import { Plus, SquarePen, Tags } from "lucide-react";

import { getAdminCategories } from "@/server/admin/queries";
import { deleteCategory } from "@/server/admin/category-actions";
import { ConfirmDeleteButton } from "@/features/admin/components/ConfirmDeleteButton";
import { CatalogSubnav } from "@/features/admin/components/CatalogSubnav";
import { SectionTitle } from "@/components/ui/section-title";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default async function AdminCategoriasPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <CatalogSubnav />

      <section className="space-y-4">
        <SectionTitle
          as="h1"
          description={`${categories.length} categoria(s).`}
          action={
            <Link
              href="/admin/categorias/novo"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Plus /> Nova categoria
            </Link>
          }
        >
          Categorias
        </SectionTitle>

        {categories.length === 0 ? (
          <EmptyState
            icon={<Tags />}
            title="Nenhuma categoria"
            description="Crie a primeira categoria do catálogo."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Ordem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: category.accent }}
                      />
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {category.sortOrder}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/categorias/${category.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" })
                        )}
                      >
                        <SquarePen /> Editar
                      </Link>
                      <ConfirmDeleteButton
                        action={deleteCategory.bind(null, category.id)}
                        confirmMessage={`Excluir a categoria "${category.name}"?`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
