import { redirect } from "next/navigation";

/** O Catálogo agora é dividido em Produtos e Categorias. */
export default function AdminIndexPage() {
  redirect("/admin/produtos");
}
