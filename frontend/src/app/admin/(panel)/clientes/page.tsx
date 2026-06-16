import Link from "next/link";
import { Users } from "lucide-react";

import { getAdminCustomers } from "@/server/admin/customer-queries";
import { formatBRL, formatCpf, formatPhone } from "@/lib/format";
import { SectionTitle } from "@/components/ui/section-title";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
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

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getAdminCustomers(q);

  return (
    <div className="space-y-4">
      <SectionTitle description={`${customers.length} cliente(s).`}>
        Clientes
      </SectionTitle>

      <form className="flex max-w-sm gap-2">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou CPF"
        />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="Nenhum cliente"
          description="Os clientes são criados automaticamente ao finalizar um pedido."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
              <TableHead className="text-right">Total gasto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {formatCpf(customer.cpf)}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.phone ? formatPhone(customer.phone) : "—"}
                </TableCell>
                <TableCell>
                  {[customer.cidade, customer.uf].filter(Boolean).join(" / ") ||
                    "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {customer.ordersCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/clientes/${customer.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" })
                    )}
                  >
                    Ver
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
