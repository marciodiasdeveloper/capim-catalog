import Link from "next/link";
import { Plus, SquarePen } from "lucide-react";

import { getAdminCategories, getAdminProducts } from "@/server/admin/queries";
import { deleteProduct } from "@/server/admin/product-actions";
import { deleteCategory } from "@/server/admin/category-actions";
import { formatBRL } from "@/lib/format";
import { ConfirmDeleteButton } from "@/features/admin/components/ConfirmDeleteButton";
import { SectionTitle } from "@/components/ui/section-title";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <SectionTitle
          as="h1"
          description={`${products.length} produto(s) no catálogo.`}
          action={
            <Link
              href="/admin/produtos/novo"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Plus /> Novo produto
            </Link>
          }
        >
          Produtos
        </SectionTitle>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {product.id}
                  </div>
                </TableCell>
                <TableCell>{categoryName(product.categoryId)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(product.price)}
                </TableCell>
                <TableCell>
                  {product.active ? (
                    <Badge variant="outline" className="text-success">
                      ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      <SquarePen /> Editar
                    </Link>
                    <ConfirmDeleteButton
                      action={deleteProduct.bind(null, product.id)}
                      confirmMessage={`Excluir "${product.name}"?`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <SectionTitle
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
      </section>
    </div>
  );
}
